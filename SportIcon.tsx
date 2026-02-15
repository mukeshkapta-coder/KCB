import React from 'react';

interface SportIconProps {
  name: string;
  color: string;
  className?: string;
}

export const SportIcon: React.FC<SportIconProps> = ({ name, color, className = "w-10 h-10" }) => {
  const icons: Record<string, React.ReactElement> = {
    lion: (
      <g>
        <circle cx="12" cy="12" r="10" fill="#1a1a1a" />
        <path d="M7 4L11 9L7 13L16 11L13 20L18 13L13 15L17 7L7 4Z" fill={color} />
        <path d="M10 8L14 10" stroke="white" strokeWidth="0.5" opacity="0.5" />
      </g>
    ),
    tiger: (
      <g>
        <circle cx="12" cy="12" r="10" fill="#1a1a1a" />
        <path d="M4 12L9 9L6 6L18 8L15 12L20 15L12 18L14 13L4 12Z" fill={color} />
        <path d="M10 10L14 14" stroke="white" strokeWidth="1" opacity="0.3" />
      </g>
    ),
    fire: (
      <g>
        <circle cx="12" cy="12" r="10" fill="#1a1a1a" />
        <path d="M12 2L15 8L22 8L17 12L19 19L12 15L5 19L7 12L2 8L9 8L12 2Z" fill={color} />
        <path d="M12 5V15" stroke="white" strokeWidth="1" opacity="0.4" />
      </g>
    ),
    warrior: (
      <g>
        <circle cx="12" cy="12" r="10" fill="#1a1a1a" />
        <path d="M5 8L12 3L19 8L17 18L12 22L7 18L5 8Z" fill={color} />
        <path d="M8 10L12 7L16 10M12 7V17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    ),
    eagle: (
      <g>
        <circle cx="12" cy="12" r="10" fill="#1a1a1a" />
        <path d="M2 10L8 8L5 4L22 10L8 12L11 16L2 10Z" fill={color} />
        <circle cx="14" cy="10" r="1.5" fill="white" />
      </g>
    ),
    shield: (
      <g>
        <circle cx="12" cy="12" r="10" fill="#1a1a1a" />
        <path d="M12 4L4 7V13C4 18 12 21 12 21C12 21 20 18 20 13V7L12 4Z" fill={color} />
        <path d="M9 10L12 13L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
    star: (
      <g>
        <circle cx="12" cy="12" r="10" fill="#1a1a1a" />
        <path d="M12 3L14 9H20L15 13L17 19L12 15L7 19L9 13L4 9H10L12 3Z" fill={color} />
        <path d="M12 8L12 15" stroke="white" strokeWidth="1" opacity="0.5" />
      </g>
    ),
    bolt: (
      <g>
        <circle cx="12" cy="12" r="10" fill="#1a1a1a" />
        <path d="M14 2L5 13H11V22L20 11H14V2Z" fill={color} />
        <path d="M9 13L15 11" stroke="white" strokeWidth="1" opacity="0.6" />
      </g>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {icons[name] || icons.shield}
    </svg>
  );
};
