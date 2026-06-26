import { useEffect, useState } from 'react';
import SuzukiLogo from './SuzukiLogo';

interface ThankYouScreenProps {
  onReset: () => void;
}

export default function ThankYouScreen({ onReset }: ThankYouScreenProps) {
  const [countdown, setCountdown] = useState(6);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setAnimate(true));

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onReset();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onReset]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #003087 0%, #0057B8 50%, #003087 100%)',
      }}
    >
      {/* Animated circles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-white"
            style={{
              width: `${300 + i * 120}px`,
              height: `${300 + i * 120}px`,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.05 + i * 0.03,
              animation: `pulseRing ${2 + i * 0.5}s ease-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-8"
        style={{
          opacity: animate ? 1 : 0,
          transform: animate ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
          transition: 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Checkmark */}
        <div
          className="mb-6 rounded-full flex items-center justify-center"
          style={{
            width: 'clamp(90px, 14vw, 130px)',
            height: 'clamp(90px, 14vw, 130px)',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '3px solid rgba(255,255,255,0.3)',
          }}
        >
          <svg
            viewBox="0 0 60 60"
            width="60%"
            height="60%"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="30" cy="30" r="28" stroke="white" strokeWidth="2.5" opacity="0.5" />
            <path
              d="M14 30 L25 41 L46 19"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: '50',
                strokeDashoffset: animate ? '0' : '50',
                transition: 'stroke-dashoffset 0.6s ease 0.4s',
              }}
            />
          </svg>
        </div>

        {/* Logo */}
        <div className="mb-6 opacity-90">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 240 80"
            width="180"
            height="60"
            aria-label="Suzuki"
          >
            <g transform="translate(0, 5)">
              <polygon points="35,0 60,25 35,50 10,25" fill="#E31837" />
              <path d="M35 10 C42 10 48 14 48 20 C48 24 45 27 40 28 L30 30 C25 31 22 34 22 38 C22 44 28 48 35 48" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" />
              <path d="M35 12 L44 12 C47 12 49 14 49 17" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" />
              <path d="M35 46 L26 46 C23 46 21 44 21 41" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" />
            </g>
            <text x="72" y="52" fontFamily="'Arial Black', 'Arial', sans-serif" fontWeight="900" fontSize="36" fill="white" letterSpacing="1">SUZUKI</text>
          </svg>
        </div>

        {/* Thank you text */}
        <h1
          className="text-white font-black mb-3 leading-tight"
          style={{ fontSize: 'clamp(32px, 5.5vw, 56px)' }}
        >
          ¡Gracias por tu opinión!
        </h1>

        <p
          className="mb-2 font-medium"
          style={{
            fontSize: 'clamp(16px, 2.5vw, 22px)',
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          Tu retroalimentación nos ayuda a mejorar
        </p>
        <p
          style={{
            fontSize: 'clamp(14px, 2vw, 18px)',
            color: 'rgba(255,255,255,0.65)',
          }}
        >
          para darte siempre el mejor servicio.
        </p>

        {/* Stars decoration */}
        <div className="flex gap-3 mt-6 mb-8">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="#FFD740"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                opacity: animate ? 1 : 0,
                transform: animate ? 'scale(1)' : 'scale(0)',
                transition: `all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.6 + i * 0.1}s`,
              }}
            >
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          ))}
        </div>

        {/* Divider */}
        <div className="w-48 h-px mb-6" style={{ background: 'rgba(255,255,255,0.2)' }} />

        {/* Countdown */}
        <div className="flex flex-col items-center gap-3">
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
            Nueva encuesta en {countdown}s
          </p>
          <div
            className="rounded-full overflow-hidden"
            style={{
              width: '200px',
              height: '4px',
              background: 'rgba(255,255,255,0.2)',
            }}
          >
            <div
              className="h-full rounded-full"
              style={{
                background: '#FFD740',
                animation: 'countdown 6s linear forwards',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
