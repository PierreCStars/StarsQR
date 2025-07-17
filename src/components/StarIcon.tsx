import React from 'react';

interface StarIconProps {
  className?: string;
  size?: number;
}

export const StarIcon: React.FC<StarIconProps> = ({ className = "", size = 24 }) => {
  return (
    <svg 
      className={className}
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main Star Shape - Solid Golden Yellow */}
      <path 
        d="M50 10 L60 30 L85 35 L65 55 L75 85 L50 70 L25 85 L35 55 L15 35 L40 30 Z" 
        fill="#FFD700" 
        stroke="none"
      />
      
      {/* Elongated Right Point (Shooting Star Effect) */}
      <path 
        d="M85 35 L95 25 L105 30 L95 35" 
        fill="#FFD700" 
        stroke="none"
      />
      
      {/* Internal Lightning Bolt Cutout */}
      <path 
        d="M35 25 L45 40 L30 50 L40 60" 
        fill="none" 
        stroke="#000" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
      
      {/* Enhanced Sharp Points */}
      <path d="M50 10 L52 20 L50 10" fill="#FFD700"/>
      <path d="M75 85 L70 75 L75 85" fill="#FFD700"/>
      <path d="M25 85 L30 75 L25 85" fill="#FFD700"/>
      <path d="M15 35 L25 40 L15 35" fill="#FFD700"/>
    </svg>
  );
}; 