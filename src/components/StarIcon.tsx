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
      <defs>
        <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#FFA500', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Main Star Shape with Dynamic Points */}
      <path 
        d="M50 8 L60 30 L85 35 L65 55 L75 85 L50 70 L25 85 L35 55 L15 35 L40 30 Z" 
        fill="url(#starGradient)" 
        stroke="#FF8C00" 
        strokeWidth="1"
      />
      
      {/* Elongated Right Point (Shooting Star Effect) */}
      <path 
        d="M85 35 L95 25 L105 30 L95 35" 
        fill="url(#starGradient)" 
        stroke="#FF8C00" 
        strokeWidth="1"
      />
      
      {/* Internal Lightning Bolt Cutout */}
      <path 
        d="M35 25 L45 40 L30 50 L40 60" 
        fill="none" 
        stroke="#000" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />
      
      {/* Enhanced Sharp Points */}
      <path d="M50 8 L52 18 L50 8" fill="url(#starGradient)"/>
      <path d="M75 85 L70 75 L75 85" fill="url(#starGradient)"/>
      <path d="M25 85 L30 75 L25 85" fill="url(#starGradient)"/>
      <path d="M15 35 L25 40 L15 35" fill="url(#starGradient)"/>
    </svg>
  );
}; 