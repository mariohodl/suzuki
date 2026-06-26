import React from 'react';

interface SuzukiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { width: 120, height: 40 },
  md: { width: 180, height: 60 },
  lg: { width: 240, height: 80 },
};

export default function SuzukiLogo({ className = '', size = 'md' }: SuzukiLogoProps) {
  const { width, height } = sizes[size];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 80"
      width={width}
      height={height}
      className={className}
      aria-label="Suzuki"
    >
      {/* S emblem */}
      <g transform="translate(0, 5)">
        {/* Outer diamond shape */}
        <polygon
          points="35,0 60,25 35,50 10,25"
          fill="#E31837"
        />
        {/* White S shape inside */}
        <path
          d="M35 10 C42 10 48 14 48 20 C48 24 45 27 40 28 L30 30 C25 31 22 34 22 38 C22 44 28 48 35 48"
          fill="none"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M35 12 L44 12 C47 12 49 14 49 17"
          fill="none"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M35 46 L26 46 C23 46 21 44 21 41"
          fill="none"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>

      {/* SUZUKI text */}
      <text
        x="72"
        y="52"
        fontFamily="'Arial Black', 'Arial', sans-serif"
        fontWeight="900"
        fontSize="36"
        fill="#003087"
        letterSpacing="1"
      >
        SUZUKI
      </text>
    </svg>
  );
}
