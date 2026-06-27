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
    <img
      src="/logo-suzuki.png"
      alt="Suzuki Logo"
      width={width}
      height={height}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
}
