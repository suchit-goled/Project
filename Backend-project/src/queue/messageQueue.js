import { EventEmitter } from "node:events";

/**
 * Enterprise In-Memory Asynchronous Message Queue
 * 
 * Provides:
 * - Decoupled background execution of async tasks (emails, notifications, analytics)
 * - Worker concurrency throttling to prevent server overload
 * - Automatic exponential retries with Dead-Letter-Queue (DLQ) containment
 * - Full telemetry metrics for health endpoints & observability
 */
class MessageQueue extends EventEmitter {
    constructor(options = {}) {
        super();
        this.concurrency = options.concurrency || 5;
        this.maxRetries = options.maxRetries || 3;
        this.activeCount = 0;

        this.queue = [];
        this.processors = new Map();
        this.deadLetterQueue = [];

        this.metrics = {
            totalEnqueued: 0,
            completed: 0,
            failed: 0,
            retried: 0,
        };
    }

    /**
     * Register a worker processor function for a specific job type
     * @param {string} jobType 
     * @param {Function} handlerAsyncFn - async (payload, job) => Promise<any>
     */
    registerProcessor(jobType, handlerAsyncFn) {
        if (typeof handlerAsyncFn !== "function") {
            throw new Error(`Handler for job type "${jobType}" must be an async function`);
        }
        this.processors.set(jobType, handlerAsyncFn);
        return this;
    }

    /**
     * Enqueue a new background job
     * @param {string} type 
     * @param {object} payload 
     * @param {object} options - { priority: boolean, maxRetries: number }
     */
    enqueue(type, payload = {}, options = {}) {
        const job = {
            id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            type,
            payload,
            attempts: 0,
            maxRetries: options.maxRetries || this.maxRetries,
            status: "pending",
            createdAt: new Date().toISOString(),
            error: null,
        };

        if (options.priority) {
            this.queue.unshift(job);
        } else {
            this.queue.push(job);
        }

        this.metrics.totalEnqueued++;
        this.emit("job:enqueued", job);

        // Trigger processing loop asynchronously
        setImmediate(() => this.processNext());

        return job.id;
    }

    /**
     * Internal processor loop respecting concurrency bounds
     */
    async processNext() {
        if (this.activeCount >= this.concurrency || this.queue.length === 0) {
            return;
        }

        const job = this.queue.shift();
        if (!job) return;

        const processor = this.processors.get(job.type);
        if (!processor) {
            console.warn(`[MessageQueue] Warning: No worker processor registered for job type: "${job.type}"`);
            job.status = "failed";
            job.error = `No processor registered for job type: ${job.type}`;
            this.deadLetterQueue.push(job);
            this.metrics.failed++;
            this.emit("job:failed", job);
            return this.processNext();
        }

        this.activeCount++;
        job.status = "processing";
        job.attempts++;
        this.emit("job:processing", job);

        try {
            const result = await processor(job.payload, job);
            job.status = "completed";
            job.result = result;
            job.completedAt = new Date().toISOString();
            this.metrics.completed++;
            this.emit("job:completed", job);
        } catch (err) {
            job.error = err.message || String(err);
            console.error(`[MessageQueue] Job ${job.id} (${job.type}) error on attempt #${job.attempts}:`, job.error);

            if (job.attempts < job.maxRetries) {
                job.status = "retrying";
                this.metrics.retried++;
                const delay = Math.min(1000 * Math.pow(2, job.attempts), 15000);
                setTimeout(() => {
                    this.queue.push(job);
                    this.processNext();
                }, delay);
            } else {
                job.status = "failed";
                this.metrics.failed++;
                this.deadLetterQueue.push(job);
                // Keep DLQ bounded at 500 items
                if (this.deadLetterQueue.length > 500) {
                    this.deadLetterQueue.shift();
                }
                this.emit("job:failed", job);
            }
        } finally {
            this.activeCount--;
            this.processNext();
        }
    }

    /**
     * Retrieve queue observability metrics
     */
    getStats() {
        return {
            status: "running",
            concurrency: this.concurrency,
            activeWorkers: this.activeCount,
            pendingJobs: this.queue.length,
            completedJobs: this.metrics.completed,
            failedJobs: this.metrics.failed,
            retriedJobs: this.metrics.retried,
            totalEnqueued: this.metrics.totalEnqueued,
            deadLetterQueueDepth: this.deadLetterQueue.length,
            registeredProcessors: Array.from(this.processors.keys()),
        };
    }
}

export const messageQueue = new MessageQueue();
export default messageQueue;
