import { useState } from 'react';
import Image from 'next/image';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface Option {
  name: string;
  image?: string;
  priceModifier: number;
}

interface CoverDesignGalleryProps {
  options: Option[];
  selectedOption: string;
  onSelectOption: (optionName: string) => void;
}

export default function CoverDesignGallery({ options, selectedOption, onSelectOption }: CoverDesignGalleryProps) {
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
    setOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {options.map((option, index) => (
          <button
            key={option.name}
            type="button"
            onClick={() => handleImageClick(index)}
            className={`relative aspect-square rounded-xl border-2 transition-all duration-200 ${ 
              selectedOption === option.name
                ? 'border-pink-500 shadow-lg'
                : 'border-transparent hover:border-pink-400'
            }`}
          >
            {option.image && (
              <Image
                src={option.image}
                alt={option.name}
                fill
                className="object-cover rounded-md"
              />
            )}
            {selectedOption === option.name && (
              <div className="absolute top-1 right-1 bg-white rounded-full p-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={selectedIndex}
        slides={options.map(option => ({ src: option.image || '/placeholder.png' }))}
        render={{ 
          slide: ({ slide, rect }) => (
            <div style={{ position: "relative", width: rect.width, height: rect.height }}>
              <Image
                src={slide.src}
                alt=""
                fill
                style={{ objectFit: "contain" }}
              />
              <button 
                onClick={() => { onSelectOption(options[selectedIndex].name); setOpen(false); }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-pink-500 bg-opacity-80 text-white px-10 py-4 rounded-full font-semibold shadow-lg hover:bg-pink-600 transition flex items-center gap-2 text-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Seleccionar este diseño
              </button>
            </div>
          ),
        }}
      />
    </>
  );
}
