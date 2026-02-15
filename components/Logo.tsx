import React from 'react';

interface LogoProps {
  className?: string;
  inverted?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-24 w-auto", inverted = false }) => {
  return (
    <div className={`${className} flex items-center group`}>
      <svg 
        viewBox="0 0 300 120" 
        className="w-full h-full drop-shadow-sm" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Stylized Speed Lines (inspired by the blue strokes in the provided logo) */}
        <path d="M20 30 L40 90" stroke="#00a4e4" strokeWidth="8" strokeLinecap="round" className="animate-pulse" />
        <path d="M45 25 L65 95" stroke="#00a4e4" strokeWidth="8" strokeLinecap="round" />
        <path d="M70 35 L90 85" stroke="#00a4e4" strokeWidth="8" strokeLinecap="round" />
        
        {/* KCB Text - Bold and Sporty */}
        <text 
          x="105" 
          y="85" 
          fill={inverted ? "white" : "#0b1a32"} 
          fontSize="72" 
          fontWeight="900" 
          fontFamily="Inter, sans-serif"
          className="italic tracking-tighter"
        >
          KCB
        </text>
        
        {/* Green Accent Dot (inspired by the green smiley/dot in the provided logo) */}
        <circle cx="265" cy="40" r="14" fill="#76b72a" />
        <path d="M258 40 Q265 47 272 40" stroke="white" strokeWidth="3" strokeLinecap="round" />

        {/* Bottom Tagline underline */}
        <path d="M105 105 L270 105" stroke="#00a4e4" strokeWidth="3" strokeLinecap="round" />
      </svg>
      
      {/* Hidden image attempt for local file support if provided later */}
      <img 
        src="./logo2.png" 
        alt="KCB" 
        className="hidden" 
        onError={(e) => (e.currentTarget.style.display = 'none')} 
      />
    </div>
  );
};
