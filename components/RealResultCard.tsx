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
            <div className="grid grid-cols-1 md:grid-cols-2">

                {/* Expectativa (Left) */}
                <div className="relative aspect-square border-b md:border-b-0 md:border-r border-gray-100">
                    <Image
                        src={mockupImage}
                        alt={`Diseño Digital - ${title}`}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-gray-900/80 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10 backdrop-blur-sm">
                        MUESTRA
                    </div>
                </div>

                {/* Realidad (Right) */}
                <div className="relative aspect-square">
                    <Image
                        src={realImage}
                        alt={`Resultado Real - ${title}`}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-naranja text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">
                        PRODUCTO
                    </div>
                </div>

            </div>
        </div>
    );
}
