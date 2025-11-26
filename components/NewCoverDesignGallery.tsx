import Image from 'next/image';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import s3Loader from '../lib/s3-loader';

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
  const galleryRef = useRef<HTMLDivElement>(null);
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

  // Auto-scroll to selected option
  useEffect(() => {
    if (selectedOptionName && scrollContainerRef.current) {
      const selectedIndex = options.findIndex(opt => opt.name === selectedOptionName);
      if (selectedIndex !== -1) {
        const selectedElement = scrollContainerRef.current.children[selectedIndex] as HTMLElement;
        if (selectedElement) {
          selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    }
  }, [selectedOptionName, options]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

      // Check if focus is within this gallery
      const galleryElement = galleryRef.current; // Use the new galleryRef
      if (!galleryElement?.contains(document.activeElement)) return;

      e.preventDefault();

      const currentIndex = options.findIndex(opt => opt.name === selectedOptionName);
      let nextIndex;

      if (e.key === 'ArrowRight') {
        nextIndex = currentIndex >= 0 ? (currentIndex + 1) % options.length : 0;
      } else { // ArrowLeft
        nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
      }

      const nextOption = options[nextIndex];
      if (nextOption) {
        onSelectOption(nextOption);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [options, selectedOptionName, onSelectOption]);

  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div ref={galleryRef}> {/* Added galleryRef to the outermost div */}
      <h3 className="font-bold text-lg text-gray-800 mb-2">{groupName}</h3>
      <div className="relative group/gallery">

        {/* Gradient Masks */}
        <div className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showLeftArrow ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showRightArrow ? 'opacity-100' : 'opacity-0'}`} />

        {showLeftArrow && (
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-1.5 shadow-md border border-gray-100 z-20 transition-all duration-200"
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className="flex items-center gap-3 overflow-x-auto pb-2 pt-2 scrollbar-hide px-1 scroll-smooth focus:outline-none"
        >
          {options.map((option, index) => (
            <button
              key={option.name}
              id={`cover-option-${index}`}
              type="button"
              onClick={() => onSelectOption(option)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-xl border-2 transition-all duration-300 focus:outline-none transform ${selectedOptionName === option.name
                ? 'border-pink-500 ring-2 ring-pink-500 scale-105'
                : 'border-gray-200 bg-white hover:border-pink-300 hover:scale-105 opacity-80 hover:opacity-100'
                }`}
              title={option.name}
            >
              {option.image && (
                <Image
                  loader={s3Loader}
                  src={option.image}
                  alt={option.name}
                  fill
                  sizes="120px"
                  className="object-contain rounded-lg p-1"
                />
              )}
              {selectedOptionName === option.name && (
                <div className="absolute top-1 right-1 bg-pink-500 text-white rounded-full p-0.5 z-10 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {showRightArrow && (
          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-1.5 shadow-md border border-gray-100 z-20 transition-all duration-200"
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default NewCoverDesignGallery;