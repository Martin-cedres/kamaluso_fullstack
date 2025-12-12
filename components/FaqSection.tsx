// components/FaqSection.tsx
import { useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  faqs: FaqItem[];
}

const FaqSection = ({ faqs }: FaqSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div key={index} className="border-b border-gray-200 pb-4">
          <button
            onClick={() => toggleFaq(index)}
            className="w-full flex justify-between items-center text-left text-lg font-semibold text-gray-800 focus:outline-none"
          >
            <span>{faq.question}</span>
            {openIndex === index ? (
              <MinusIcon className="h-6 w-6 text-pink-500" />
            ) : (
              <PlusIcon className="h-6 w-6 text-gray-500" />
            )}
          </button>
          {openIndex === index && (
            <div className="mt-3 text-base text-gray-600 leading-relaxed prose max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(faq.answer) }} />
          )}
        </div>
      ))}
    </div>
  );
};

export default FaqSection;
