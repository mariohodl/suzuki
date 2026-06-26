import React, { useRef } from 'react';

type Mood = 'happy' | 'neutral' | 'sad';

interface FaceButtonProps {
  mood: Mood;
  label: string;
  selected: boolean;
  onClick: () => void;
}

const faceColors: Record<Mood, { bg: string; shadow: string; ring: string }> = {
  happy: { bg: '#B5E853', shadow: '#8BC34A', ring: '#C8F07A' },
  neutral: { bg: '#FFD740', shadow: '#FFC107', ring: '#FFE680' },
  sad: { bg: '#CC3300', shadow: '#992200', ring: '#EE4400' },
};

function HappyFace({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <circle cx="50" cy="50" r="48" fill={color} />
      <circle cx="50" cy="50" r="48" fill="url(#happyGrad)" opacity="0.3" />
      <defs>
        <radialGradient id="happyGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity="0.5" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Eyebrows */}
      <path d="M28 32 Q35 27 42 32" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M58 32 Q65 27 72 32" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Eyes */}
      <circle cx="35" cy="42" r="7" fill="white" />
      <circle cx="65" cy="42" r="7" fill="white" />
      <circle cx="36" cy="43" r="4" fill="#222" />
      <circle cx="66" cy="43" r="4" fill="#222" />
      <circle cx="37" cy="41" r="1.5" fill="white" />
      <circle cx="67" cy="41" r="1.5" fill="white" />
      {/* Smile */}
      <path d="M30 65 Q50 82 70 65" stroke="#333" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* Cheeks */}
      <circle cx="22" cy="62" r="8" fill="#FF9999" opacity="0.35" />
      <circle cx="78" cy="62" r="8" fill="#FF9999" opacity="0.35" />
    </svg>
  );
}

function NeutralFace({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <circle cx="50" cy="50" r="48" fill={color} />
      <circle cx="50" cy="50" r="48" fill="url(#neutralGrad)" opacity="0.3" />
      <defs>
        <radialGradient id="neutralGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity="0.5" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Eyebrows - slightly raised/concerned */}
      <path d="M28 33 Q35 29 42 33" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M58 33 Q65 29 72 33" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Eyes */}
      <circle cx="35" cy="44" r="7" fill="white" />
      <circle cx="65" cy="44" r="7" fill="white" />
      <circle cx="35" cy="45" r="4" fill="#222" />
      <circle cx="65" cy="45" r="4" fill="#222" />
      <circle cx="36" cy="43" r="1.5" fill="white" />
      <circle cx="66" cy="43" r="1.5" fill="white" />
      {/* Neutral mouth */}
      <line x1="33" y1="68" x2="67" y2="68" stroke="#333" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

function SadFace({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <circle cx="50" cy="50" r="48" fill={color} />
      <circle cx="50" cy="50" r="48" fill="url(#sadGrad)" opacity="0.2" />
      <defs>
        <radialGradient id="sadGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Angry/sad eyebrows */}
      <path d="M28 36 Q35 31 42 36" stroke="#222" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M58 36 Q65 31 72 36" stroke="#222" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* Eyes */}
      <circle cx="35" cy="46" r="7" fill="white" />
      <circle cx="65" cy="46" r="7" fill="white" />
      <circle cx="35" cy="47" r="4.5" fill="#222" />
      <circle cx="65" cy="47" r="4.5" fill="#222" />
      <circle cx="36" cy="45" r="1.5" fill="white" />
      <circle cx="66" cy="45" r="1.5" fill="white" />
      {/* Frown */}
      <path d="M33 74 Q50 62 67 74" stroke="#222" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

const faces: Record<Mood, React.FC<{ color: string }>> = {
  happy: HappyFace,
  neutral: NeutralFace,
  sad: SadFace,
};

export default function FaceButton({ mood, label, selected, onClick }: FaceButtonProps) {
  const { bg, shadow, ring } = faceColors[mood];
  const Face = faces[mood];
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Ripple effect
    const btn = btnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      ripple.style.background = bg + '80';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    }
    onClick();
  };

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      className={`face-btn relative flex flex-col items-center gap-3 p-2 rounded-2xl outline-none focus:outline-none ${
        selected ? 'selected' : ''
      }`}
      style={{
        transform: selected ? 'scale(1.08)' : 'scale(1)',
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        overflow: 'hidden',
      }}
      aria-pressed={selected}
      aria-label={label}
    >
      {/* Glow ring when selected */}
      {selected && (
        <span
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `0 0 0 4px ${ring}, 0 0 24px ${ring}`,
            borderRadius: '50%',
            top: '0',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            aspectRatio: '1',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Face container */}
      <div
        className="relative rounded-full flex-shrink-0"
        style={{
          width: 'clamp(110px, 18vw, 170px)',
          height: 'clamp(110px, 18vw, 170px)',
          filter: selected
            ? `drop-shadow(0 8px 20px ${shadow}80) drop-shadow(0 0 12px ${ring})`
            : `drop-shadow(0 6px 12px ${shadow}60)`,
          transition: 'filter 0.3s ease',
        }}
      >
        <Face color={bg} />
      </div>

      {/* Label */}
      <span
        className="font-bold text-center"
        style={{
          fontSize: 'clamp(14px, 2.2vw, 20px)',
          color: selected ? bg === '#B5E853' ? '#5a8a00' : bg === '#FFD740' ? '#8a6500' : '#CC3300' : '#555',
          transition: 'color 0.3s ease',
          fontWeight: selected ? '800' : '600',
        }}
      >
        {label}
      </span>
    </button>
  );
}
