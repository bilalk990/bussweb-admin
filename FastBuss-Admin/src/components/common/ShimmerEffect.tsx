import React from 'react';

interface ShimmerEffectProps {
  className?: string;
}

const ShimmerEffect: React.FC<ShimmerEffectProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-shimmer ${className}`}
      style={{
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
};

export default ShimmerEffect; 