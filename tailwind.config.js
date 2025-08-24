// tailwind.config.js
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores principales de Kamaluso
        naranja: "#FF6B35",
        amarillo: "#FFD100",
        verde: "#2ECC71",      // Mantengo el verde anterior
        verdeClaro: "#00B894", // Nuevo verde del segundo config
        azul: "#1F75FE",
        morado: "#8E44AD",     // Original
        moradoClaro: "#6C63FF", // Nuevo morado del segundo config
        rosa: "#E84393",
        fucsia: "#E84393",     // Alias para rosa/fucsia
        fondoClaro: "#F8F9FA",
        fondo: "#F9FAFB",       // Nuevo fondo
        fondoOscuro: "#121212",
        textoPrimario: "#1A1A1A", // Original
        textoPrimarioClaro: "#333333", // Nuevo
        textoSecundario: "#666666",
        textoClaro: "#FFFFFF",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        kamaluso: "0 4px 16px rgba(255,107,53,0.15)", // original
        kamalusoSoft: "0 4px 14px rgba(0,0,0,0.1)",   // nuevo
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
