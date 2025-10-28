import Image from 'next/image';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export interface DesignOption {
  name: string;
  image?: string;
  priceModifier: number;
}

interface NewCoverDesignGalleryProps {
  options: DesignOption[];
  selectedOptionName?: string;
  onSelectOption: (option: DesignOption) => void;
  groupName: string;
}

const NewCoverDesignGallery: React.FC<NewCoverDesignGalleryProps> = ({
  options,
  selectedOptionName,
  onSelectOption,
  groupName,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkForScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1); // -1 for precision issues
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkForScroll();
      window.addEventListener('resize', checkForScroll);
      container.addEventListener('scroll', checkForScroll);

      return () => {
        window.removeEventListener('resize', checkForScroll);
        container.removeEventListener('scroll', checkForScroll);
      };
    }
  }, [options, checkForScroll]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-2">{groupName}</label>
      <div className="relative group">
        <div 
          ref={scrollContainerRef} 
          className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide"
        >
          {options.map((option) => (
            <button
              key={option.name}
              type="button"
              onClick={() => onSelectOption(option)}
              className={`relative flex-shrink-0 w-24 h-24 rounded-lg border-2 transition-all duration-200 ${
                selectedOptionName === option.name
                  ? 'border-pink-500 ring-2 ring-pink-500/50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-pink-400'
              }`}
              title={option.name}
            >
              {option.image && (
                <Image
                  src={option.image}
                  alt={option.name}
                  fill
                  sizes="120px"
                  className="object-contain rounded-md p-1"
                />
              )}
              {selectedOptionName === option.name && (
                <div className="absolute top-1 right-1 bg-pink-500 text-white rounded-full p-0.5 z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {showLeftArrow && (
          <button 
            type="button"
            onClick={() => scroll('left')}
            className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-4 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-white"
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
          </button>
        )}
        {showRightArrow && (
          <button 
            type="button"
            onClick={() => scroll('right')}
            className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-4 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-white"
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="h-6 w-6 text-gray-700" />
          </button>
        )}
      </div>
    </div>
  );
};

export default NewCoverDesignGallery;