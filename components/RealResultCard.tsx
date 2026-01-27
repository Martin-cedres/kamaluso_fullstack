import Image from 'next/image';

interface RealResultCardProps {
    title: string;
    description?: string;
    mockupImage: string;
    realImage: string;
}

export default function RealResultCard({ title, description, mockupImage, realImage }: RealResultCardProps) {
    return (
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100">

            {/* Header */}
            <div className="p-4 border-b border-gray-50">
                <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
                {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
            </div>

            {/* Side-by-Side Comparison - Square (1:1) Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                {/* Expectativa (Left) */}
                <div className="relative aspect-square border-b md:border-b-0 md:border-r border-gray-100 overflow-hidden">
                    <Image
                        src={mockupImage}
                        alt={`Diseño Digital - ${title}`}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute top-4 left-4 bg-slate-900/80 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm z-10 backdrop-blur-sm tracking-widest uppercase">
                        Muestra Digital
                    </div>
                </div>

                {/* Realidad (Right) */}
                <div className="relative aspect-square overflow-hidden">
                    <Image
                        src={realImage}
                        alt={`Resultado Real - ${title}`}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm z-10 tracking-widest uppercase">
                        Foto Real
                    </div>
                </div>
            </div>

            {/* Footer / Instagram CTA */}
            <div className="p-4 bg-slate-50 flex items-center justify-between">
                <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200"></div>
                    ))}
                    <span className="text-[10px] text-slate-400 ml-4 font-bold flex items-center">+100 vendidos</span>
                </div>
                <a
                    href="https://www.instagram.com/kamaluso.uy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-pink-600 transition-colors"
                >
                    <span>Ver en Instagram</span>
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.247 2.242 1.308 3.607.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.061 1.365-.333 2.632-1.308 3.607-.975.975-2.242 1.247-3.607 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.063-2.633-.333-3.608-1.308-.975-.975-1.247-2.242-1.308-3.607-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.247 3.607-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.058-1.281.072-1.689.072-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                </a>
            </div>
        </div>
    );
}
