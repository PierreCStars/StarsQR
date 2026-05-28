import React from 'react';

interface StarIconProps {
  className?: string;
}

// Sizing is controlled by the caller via Tailwind classes (e.g. h-9 w-9, h-16 w-16).
// `object-contain` preserves the logo's aspect ratio (the PNG is 4025x3064, not square).
export const StarIcon: React.FC<StarIconProps> = ({ className = "" }) => {
  return (
    <img
      src="/star-logo.png"
      alt="Stars Logo"
      className={`object-contain ${className}`}
    />
  );
}; 