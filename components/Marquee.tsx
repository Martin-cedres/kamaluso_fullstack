import React from 'react';
import { motion } from 'framer-motion';

interface MarqueeProps {
    items: string[];
    speed?: number; // Duration in seconds for one full loop
    className?: string;
}

const Marquee: React.FC<MarqueeProps> = ({ items, speed = 20, className = '' }) => {
    return (
        <div className={`relative flex overflow-hidden bg-pink-600 text-white py-3 ${className}`}>
            <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-pink-600 via-transparent to-pink-600 w-full h-full opacity-60"></div>

            <motion.div
                className="flex whitespace-nowrap flex-nowrap"
                animate={{ x: [0, -1000] }} // Adjust based on content width, or use percentage if container is wide enough
                transition={{
                    x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: speed,
                        ease: "linear",
                    },
                }}
                style={{ width: 'max-content' }} // Ensure container fits content
            >
                {/* Render items multiple times to ensure seamless loop */}
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center">
                        {items.map((item, idx) => (
                            <span key={idx} className="mx-8 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                <span className="text-pink-200">★</span> {item}
                            </span>
                        ))}
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default Marquee;
