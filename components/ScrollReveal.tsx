import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface ScrollRevealProps {
    children: React.ReactNode;
    width?: 'fit-content' | '100%';
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
}


const ScrollReveal: React.FC<ScrollRevealProps> = ({
    children,
    width = '100%',
    delay = 0,
    direction = 'up'
}) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    const directionOffset = {
        up: { y: 75, x: 0 },
        down: { y: -75, x: 0 },
        left: { y: 0, x: 75 },
        right: { y: 0, x: -75 },
    };

    return (
        <div ref={ref} style={{ width, position: 'relative', overflow: 'hidden' }}>
            <motion.div
                variants={{
                    hidden: { opacity: 0, ...directionOffset[direction] },
                    visible: { opacity: 1, y: 0, x: 0 },
                }}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                transition={{
                    duration: 0.6,
                    delay: delay,
                    ease: [0.22, 1, 0.36, 1] // Custom easing for smooth organic feel
                }}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default ScrollReveal;
