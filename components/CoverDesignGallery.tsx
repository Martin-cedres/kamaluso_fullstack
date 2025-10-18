import Image from 'next/image';

interface Option {
  name: string;
  image?: string;
  priceModifier: number;
}

interface CoverDesignGalleryProps {
  options: Option[];
  selectedOption?: string; // Make optional as it might not be set initially
  onSelectOption: (optionName: string) => void;
}

const CoverDesignGallery: React.FC<CoverDesignGalleryProps> = ({
  options,
  selectedOption,
  onSelectOption,
}) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
      {options.map((option) => (
        <button
          key={option.name}
          type="button"
          onClick={() => onSelectOption(option.name)}
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
                  </button>      ))}
    </div>
  );
};

export default CoverDesignGallery;
