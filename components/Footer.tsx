export default function Footer() {
  return (
    <footer className="bg-[#121212] text-white py-6 mt-12">
      <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">&copy; 2025 Kamaluso. Todos los derechos reservados.</p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <a href="#" className="hover:text-[#FF6B35] transition-colors">Facebook</a>
          <a href="#" className="hover:text-[#FF6B35] transition-colors">Instagram</a>
          <a href="#" className="hover:text-[#FF6B35] transition-colors">Twitter</a>
        </div>
      </div>
    </footer>
  );
}
