import { motion } from 'framer-motion';

interface OrganicBlobProps {
  color: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animationSpeed?: 'slow' | 'medium' | 'fast';
  blur?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

const OrganicBlob = ({
  color,
  size = 'lg',
  className = '',
  animationSpeed = 'slow',
  blur = '3xl'
}: OrganicBlobProps) => {

  // Responsive sizes: mobile first, then tablet/desktop
  const sizeClasses = {
    sm: 'w-24 h-24 md:w-32 md:h-32',
    md: 'w-32 h-32 md:w-48 md:h-48',
    lg: 'w-48 h-48 md:w-64 md:h-64',
    xl: 'w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96'
  };

  const speedDurations = {
    slow: 20,
    medium: 12,
    fast: 8
  };

  const blurClasses = {
    sm: 'blur-sm',
    md: 'blur-md',
    lg: 'blur-lg',
    xl: 'blur-xl',
    '2xl': 'blur-2xl',
    '3xl': 'blur-3xl'
  };

  return (
    <motion.div
      className={`absolute ${sizeClasses[size]} ${blurClasses[blur]} opacity-20 ${className}`}
      style={{ backgroundColor: color }}
      animate={{
        borderRadius: [
          '60% 40% 30% 70% / 60% 30% 70% 40%',
          '30% 60% 70% 40% / 50% 60% 30% 60%',
          '50% 50% 30% 70% / 30% 30% 70% 70%',
          '60% 40% 30% 70% / 60% 30% 70% 40%'
        ],
        x: [0, 30, -20, 0],
        y: [0, -30, 20, 0],
      }}
      transition={{
        duration: speedDurations[animationSpeed],
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  );
};

export default OrganicBlob;
