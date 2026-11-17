import React, { useState, useEffect } from "react";
import {
    FiDollarSign,
    FiTrendingUp,
    FiPercent,
    FiClock,
    FiCheckCircle,
    FiAlertCircle,
    FiCreditCard,
    FiRefreshCw,
    FiShield,
} from "react-icons/fi";
import SellerService from "../../services/seller.service";
import "./SellerEarnings.css";

const SellerEarnings = () => {
    const [loading, setLoading] = useState(true);
    const [earningsData, setEarningsData] = useState({
        grossSales: 0,
        commissionDeducted: 0,
        netEarnings: 0,
        totalPayouts: 0,
        pendingBalance: 0,
        payouts: [],
    });
    const [feedback, setFeedback] = useState(null);

    const fetchEarnings = async () => {
        setLoading(true);
        try {
            const data = await SellerService.getEarnings();
            if (data) {
                setEarningsData(data);
            }
        } catch (err) {
            console.error("Failed to load earnings ledger:", err);
            setFeedback({ type: "error", message: "Failed to load financial records." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEarnings();
    }, []);

    const formatINR = (val) => `₹${Number(val || 0).toLocaleString("en-IN")}`;

    return (
        <div className="seller-earnings-page">
            {/* Header */}
            <div className="earnings-header">
                <div>
                    <h2>Earnings & Financial Ledger</h2>
                    <p>Track your sales revenues, platform commission deductions, and automated payout settlements.</p>
                </div>
                <div className="header-actions">
                    <button
                        className="refresh-btn"
                        onClick={fetchEarnings}
                        title="Refresh ledger"
                        disabled={loading}
                    >
                        <FiRefreshCw className={loading ? "spin" : ""} />
                    </button>
                </div>
            </div>

            {feedback && (
                <div className={`feedback-alert ${feedback.type}`}>
                    <FiAlertCircle />
                    <span>{feedback.message}</span>
                </div>
            )}

            {/* KPI Financial Cards */}
            <div className="earnings-cards-grid">
                <div className="finance-card gross">
                    <div className="card-top">
                        <span className="card-title">Gross Sales</span>
                        <div className="card-icon-badge gross-icon">
                            <FiTrendingUp />
                        </div>
                    </div>
                    <div className="card-amount">{formatINR(earningsData.grossSales)}</div>
                    <div className="card-subtitle">Total value of all confirmed orders</div>
                </div>

                <div className="finance-card commission">
                    <div className="card-top">
                        <span className="card-title">Commission Deducted</span>
                        <div className="card-icon-badge comm-icon">
                            <FiPercent />
                        </div>
                    </div>
                    <div className="card-amount">-{formatINR(earningsData.commissionDeducted)}</div>
                    <div className="card-subtitle">Marketplace platform fee</div>
                </div>

                <div className="finance-card net">
                    <div className="card-top">
                        <span className="card-title">Net Seller Earnings</span>
                        <div className="card-icon-badge net-icon">
                            <FiDollarSign />
                        </div>
                    </div>
                    <div className="card-amount">{formatINR(earningsData.netEarnings)}</div>
                    <div className="card-subtitle">Gross Sales minus platform commission</div>
                </div>

                <div className="finance-card balance">
                    <div className="card-top">
                        <span className="card-title">Pending Settlement</span>
                        <div className="card-icon-badge bal-icon">
                            <FiClock />
                        </div>
                    </div>
                    <div className="card-amount">
                        {formatINR(earningsData.pendingBalance ?? (earningsData.netEarnings - (earningsData.totalPayouts || 0)))}
                    </div>
                    <div className="card-subtitle">Next settlement cycle payout</div>
                </div>
            </div>

            {/* Commission Policy Transparency Box */}
            <div className="commission-policy-card">
                <div className="policy-icon">
                    <FiShield />
                </div>
                <div className="policy-info">
                    <h4>ElectroNova Commission & Payout Policy</h4>
                    <p>
                        Our platform commission is calculated transparently per completed sub-order based on product category rules (typically 4% to 8%).
                        Commission is locked in at the moment of customer checkout so future rate revisions will never affect historical orders.
                        Payouts are batched and transferred directly to your registered bank account via NEFT/IMPS.
                    </p>
                </div>
            </div>

            {/* Payout History Ledger */}
            <div className="payout-ledger-card">
                <div className="ledger-header">
                    <div>
                        <h3>Payout Settlement History</h3>
                        <p>Bank transfer records and settlement receipts.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="ledger-loading">
                        <div className="spinner"></div>
                        <p>Loading settlement history...</p>
                    </div>
                ) : !earningsData.payouts || earningsData.payouts.length === 0 ? (
                    <div className="ledger-empty">
                        <FiCreditCard className="empty-icon" />
                        <h4>No payouts generated yet</h4>
                        <p>
                            Once your delivered orders pass the customer return window, settlements will appear here automatically.
                        </p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="ledger-table">
                            <thead>
                                <tr>
                                    <th>Payout ID</th>
                                    <th>Settlement Date</th>
                                    <th>Gross Sales</th>
                                    <th>Commission Deducted</th>
                                    <th>Net Payout</th>
                                    <th>Bank Account / Mode</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {earningsData.payouts.map((payout, idx) => (
                                    <tr key={payout._id || idx}>
                                        <td className="payout-id-cell">
                                            <strong>{payout.payoutNumber || `PAY-2026-${String(idx + 1).padStart(3, "0")}`}</strong>
                                        </td>
                                        <td>
                                            {payout.createdAt
                                                ? new Date(payout.createdAt).toLocaleDateString("en-IN", {
                                                      day: "numeric",
                                                      month: "short",
                                                      year: "numeric",
                                                  })
                                                : "Recent"}
                                        </td>
                                        <td>{formatINR(payout.grossSales)}</td>
                                        <td className="commission-cell">-{formatINR(payout.commissionDeducted)}</td>
                                        <td className="net-cell">
                                            <strong>{formatINR(payout.netAmount)}</strong>
                                        </td>
                                        <td>
                                            <span className="bank-info">
                                                {payout.bankDetails?.accountNumber
                                                    ? `•••• ${String(payout.bankDetails.accountNumber).slice(-4)} (${payout.bankDetails.ifsc || "NEFT"})`
                                                    : "Bank Transfer (NEFT/IMPS)"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`payout-status-badge ${payout.status || "completed"}`}>
                                                <FiCheckCircle /> {payout.status || "Completed"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerEarnings;
