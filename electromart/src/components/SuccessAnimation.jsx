import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";

const SuccessAnimation = () => {
    const [size, setSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <>
            <Confetti
                width={size.width}
                height={size.height}
                recycle={false}
                numberOfPieces={250}
            />

            <motion.div
                className="success-animation"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 180,
                    damping: 12,
                }}
            >
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                    }}
                >
                    <FaCheckCircle className="success-icon" />
                </motion.div>
            </motion.div>
        </>
    );
};

export default SuccessAnimation;