import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HeroTextRotator = () => {
    const [heroTextIndex, setHeroTextIndex] = useState(0);
    const heroTexts = ["vos", "tu empresa", "regalar"];

    useEffect(() => {
        const interval = setInterval(() => {
            setHeroTextIndex((prev) => (prev + 1) % heroTexts.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <span className="block overflow-visible">
            <AnimatePresence mode="wait">
                <motion.span
                    key={heroTextIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-block"
                >
                    {heroTexts[heroTextIndex]}.
                </motion.span>
            </AnimatePresence>
        </span>
    );
};

export default HeroTextRotator;
