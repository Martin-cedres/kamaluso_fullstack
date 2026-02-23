import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HeroTextRotator = () => {
    const [heroTextIndex, setHeroTextIndex] = useState(0);

    // Frases solicitadas con gradientes "Luxury" recomendados por Stitch
    const heroTexts = [
        { text: "ordenar tu vida", gradient: "from-rose-400 via-pink-500 to-rose-600" },          // Rose Gold
        { text: "hacer un gran regalo", gradient: "from-amber-400 via-orange-500 to-amber-600" }, // Sunset Amber
        { text: "potenciar tu empresa", gradient: "from-blue-600 via-indigo-600 to-blue-800" },   // Ocean Indigo
        { text: "destacar tu marca", gradient: "from-emerald-500 via-teal-600 to-emerald-700" }   // Emerald Teal
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setHeroTextIndex((prev) => (prev + 1) % heroTexts.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <span className="block overflow-visible pb-2">
            <AnimatePresence mode="wait">
                <motion.span
                    key={heroTextIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`inline-block bg-gradient-to-r ${heroTexts[heroTextIndex].gradient} bg-clip-text text-transparent font-serif italic pb-1`}
                    style={{ lineHeight: 1.2 }}
                >
                    {heroTexts[heroTextIndex].text}.
                </motion.span>
            </AnimatePresence>
        </span>
    );
};

export default HeroTextRotator;
