import React from 'react';

interface StarIconProps {
  className?: string;
  size?: number;
}

export const StarIcon: React.FC<StarIconProps> = ({ className = "", size = 24 }) => {
  return (
    <img 
      src="/star-logo.png"
      alt="Stars Logo"
      className={className}
      style={{ width: size, height: size }}
    />
  );
}; 