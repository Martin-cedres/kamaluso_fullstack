import Image from 'next/image';
import { useState } from 'react';

interface Option {
  name: string;
  image?: string;
  priceModifier: number;
}

interface CoverDesignGalleryProps {
  options: Option[];
  selectedOption?: string;
  onSelectOption: (optionName: string) => void;
  displayAsDropdown?: boolean;
}

const PreviewModal = ({ option, onClose, onSelect }: { option: Option; onClose: () => void; onSelect: (name: string) => void; }) => {
  if (!option) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-lg w-full">
        <div className="relative aspect-square w-full max-w-md mx-auto">
          {option.image && (
            <Image
              src={option.image}
              alt={option.name}
              fill
              sizes="500px"
              className="object-contain rounded-lg"
            />
          )}
        </div>
        <h3 className="text-xl font-bold text-center mt-4">{option.name}</h3>
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={() => {
              onSelect(option.name);
              onClose();
            }}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-pink-600 transition"
          >
            Seleccionar
          </button>
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};


const CoverDesignGallery: React.FC<CoverDesignGalleryProps> = ({
  options,
  selectedOption,
  onSelectOption,
  displayAsDropdown = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<Option | null>(null);

  const handlePreview = (option: Option) => {
    setPreviewImage(option);
    setIsModalOpen(true);
  };

  if (displayAsDropdown) {
    return (
      <select
        value={selectedOption || ''}
        onChange={(e) => onSelectOption(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
      >
        <option value="" disabled>Selecciona un diseño</option>
        {options.map((option) => (
          <option key={option.name} value={option.name}>
            {option.name}
            {option.priceModifier > 0 && ` (+ $U ${option.priceModifier})`}
          </option>
        ))}
      </select>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {options.map((option) => (
          <button
            key={option.name}
            type="button"
            onClick={() => handlePreview(option)}
            className={`relative aspect-square rounded-xl border-2 transition-all duration-200 ${ 
              selectedOption === option.name
                ? 'border-pink-500 ring-2 ring-pink-500 shadow-md bg-pink-50'
                : 'border-gray-300 bg-white hover:border-pink-400 hover:shadow-sm'
            }`}
          >
            {option.image && (
              <Image
                src={option.image}
                alt={option.name}
                fill
                sizes="150px"
                className="object-cover rounded-md"
              />
            )}
            {selectedOption === option.name && (
              <div className="absolute top-1 right-1 bg-pink-500 text-white rounded-full p-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
      {isModalOpen && previewImage && (
        <PreviewModal
          option={previewImage}
          onClose={() => setIsModalOpen(false)}
          onSelect={onSelectOption}
        />
      )}
    </>
  );
};

export default CoverDesignGallery;