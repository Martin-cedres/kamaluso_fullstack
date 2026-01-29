import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HeroTextRotator = () => {
    const [heroTextIndex, setHeroTextIndex] = useState(0);

    // Palabras con gradientes de colores del logo
    const heroTexts = [
        { text: "vos", gradient: "from-rosa via-naranja to-naranja" },           // Rosa → Naranja
        { text: "tu empresa", gradient: "from-azul via-morado to-moradoClaro" }, // Azul → Morado
        { text: "regalar", gradient: "from-amarillo via-verde to-verdeClaro" }   // Amarillo → Verde
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
                    className={`inline-block bg-gradient-to-r ${heroTexts[heroTextIndex].gradient} bg-clip-text text-transparent font-extrabold pb-1`}
                    style={{ lineHeight: 1.2 }}
                >
                    {heroTexts[heroTextIndex].text}.
                </motion.span>
            </AnimatePresence>
        </span>
    );
};

export default HeroTextRotator;
