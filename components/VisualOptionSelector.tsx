import React from 'react';
import Image from 'next/image';
import { CheckIcon } from '@heroicons/react/24/solid';

export interface VisualOption {
    name: string;
    image?: string;
    color?: string; // Hex code or valid CSS color
    priceModifier?: number;
}

interface VisualOptionSelectorProps {
    type: 'grid' | 'color' | 'text' | 'button';
    options?: VisualOption[];
    selectedOption?: string;
    onSelect: (value: string) => void;
    title: string;
    required?: boolean;
}

// Helper to map common color names to hex if needed, or use as is
const getColor = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('dorado') || lower.includes('oro')) return '#FFD700';
    if (lower.includes('plateado') || lower.includes('plata')) return '#C0C0C0';
    if (lower.includes('rosa') || lower.includes('pink')) return '#FFC0CB';
    if (lower.includes('negro')) return '#000000';
    if (lower.includes('blanco')) return '#FFFFFF';
    if (lower.includes('azul')) return '#3B82F6';
    if (lower.includes('verde')) return '#10B981';
    if (lower.includes('rojo')) return '#EF4444';
    if (lower.includes('amarillo')) return '#F59E0B';
    if (lower.includes('violeta') || lower.includes('lila')) return '#8B5CF6';
    if (lower.includes('cobre')) return '#B87333';
    if (lower.includes('bronce')) return '#CD7F32';
    return '#E5E7EB'; // Default gray
};

const VisualOptionSelector: React.FC<VisualOptionSelectorProps> = ({
    type,
    options = [],
    selectedOption,
    onSelect,
    title,
    required
}) => {

    return (
        <div className="mb-6">
            <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center">
                {title}
                {required && <span className="text-red-500 ml-1">*</span>}
                {selectedOption && type !== 'text' && (
                    <span className="ml-2 text-sm font-normal text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                        {selectedOption}
                    </span>
                )}
            </h3>

            {/* --- TYPE: COLOR SWATCHES --- */}
            {type === 'color' && (
                <div className="flex flex-wrap gap-3">
                    {options.map((opt) => {
                        const colorCode = opt.color || getColor(opt.name);
                        const isSelected = selectedOption === opt.name;
                        const isWhite = colorCode.toLowerCase() === '#ffffff' || colorCode.toLowerCase() === 'white';

                        return (
                            <button
                                key={opt.name}
                                onClick={() => onSelect(opt.name)}
                                className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isSelected ? 'ring-2 ring-offset-2 ring-pink-500 scale-110' : 'hover:scale-105 ring-1 ring-gray-200'}`}
                                title={opt.name}
                            >
                                <span
                                    className="absolute inset-0 rounded-full border border-black/5"
                                    style={{ backgroundColor: colorCode }}
                                />
                                {isSelected && (
                                    <CheckIcon className={`w-6 h-6 z-10 ${isWhite ? 'text-gray-800' : 'text-white'}`} />
                                )}
                                <span className="sr-only">{opt.name}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* --- TYPE: GRID (IMAGES) --- */}
            {type === 'grid' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {options.map((opt) => {
                        const isSelected = selectedOption === opt.name;
                        return (
                            <div
                                key={opt.name}
                                onClick={() => onSelect(opt.name)}
                                className={`relative cursor-pointer rounded-xl border-2 overflow-hidden transition-all duration-300 group ${isSelected ? 'border-pink-500 shadow-md bg-pink-50/30' : 'border-gray-200 hover:border-pink-300 bg-white'}`}
                            >
                                <div className="aspect-[4/3] relative bg-gray-100">
                                    {opt.image ? (
                                        <Image
                                            src={opt.image}
                                            alt={opt.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 50vw, 33vw"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-pink-500/10 flex items-center justify-center">
                                            <div className="bg-white rounded-full p-1 shadow-sm">
                                                <CheckIcon className="w-4 h-4 text-pink-500" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 text-center">
                                    <span className={`text-sm font-medium block truncate ${isSelected ? 'text-pink-700' : 'text-gray-700'}`}>
                                        {opt.name}
                                    </span>
                                    {opt.priceModifier && opt.priceModifier > 0 && (
                                        <span className="text-xs text-pink-500 font-semibold">
                                            + $U {opt.priceModifier}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* --- TYPE: TEXT INPUT --- */}
            {type === 'text' && (
                <div className="relative">
                    <input
                        type="text"
                        value={selectedOption || ''}
                        onChange={(e) => onSelect(e.target.value)}
                        placeholder="Escribe aquí (ej: María, 2026)..."
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-pink-500 transition-colors text-gray-800 placeholder-gray-400"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </div>
                </div>
            )}

            {/* --- TYPE: BUTTON (DEFAULT) --- */}
            {type === 'button' && (
                <div className="flex flex-wrap gap-3">
                    {options.map((opt) => {
                        const isSelected = selectedOption === opt.name;
                        return (
                            <button
                                key={opt.name}
                                onClick={() => onSelect(opt.name)}
                                className={`px-6 py-3 rounded-xl border-2 text-sm font-bold transition-all duration-200 ${isSelected
                                    ? 'bg-pink-500 text-white border-pink-500 shadow-md transform scale-105'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                                    }`}
                            >
                                {opt.name}
                                {opt.priceModifier && opt.priceModifier > 0 && (
                                    <span className={`ml-1 text-xs ${isSelected ? 'text-pink-100' : 'text-pink-500'}`}>
                                        (+$U {opt.priceModifier})
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default VisualOptionSelector;
