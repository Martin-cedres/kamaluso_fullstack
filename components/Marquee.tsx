import React from 'react';
import { motion } from 'framer-motion';

interface MarqueeProps {
    items: string[];
    speed?: number; // Duration in seconds for one full loop
    className?: string;
}

const Marquee: React.FC<MarqueeProps> = ({ items, speed = 20, className = '' }) => {
    return (
        <div className={`relative flex overflow-hidden bg-gradient-to-r from-rosa via-naranja to-amarillo text-white py-4 shadow-lg ${className}`}>
            {/* Subtle shimmer effect */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
            </div>

            <motion.div
                className="flex whitespace-nowrap flex-nowrap"
                animate={{ x: [0, -1000] }}
                transition={{
                    x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: speed,
                        ease: "linear",
                    },
                }}
                style={{ width: 'max-content' }}
            >
                {/* Render items multiple times to ensure seamless loop */}
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center">
                        {items.map((item, idx) => (
                            <span key={idx} className="mx-8 text-sm font-bold uppercase tracking-wider flex items-center gap-2 drop-shadow-md">
                                <span className="text-yellow-200 text-lg">★</span> {item}
                            </span>
                        ))}
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default Marquee;
