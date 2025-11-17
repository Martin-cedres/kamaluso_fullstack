// components/UseCasesSection.tsx
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface UseCasesSectionProps {
  useCases: string[];
}

const UseCasesSection = ({ useCases }: UseCasesSectionProps) => {
  if (!useCases || useCases.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-4">
        {useCases.map((useCase, index) => (
          <li key={index} className="flex items-start">
            <CheckCircleIcon className="h-6 w-6 text-pink-500 mr-4 flex-shrink-0 mt-1" />
            <span className="text-gray-700 text-lg">{useCase}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UseCasesSection;
