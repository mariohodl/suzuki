interface StepDotsProps {
  total: number;
  current: number;
}

export default function StepDots({ total, current }: StepDotsProps) {
  return (
    <div className="flex items-center gap-3 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-500"
          style={{
            width: i === current ? '28px' : '10px',
            height: '10px',
            background: i < current
              ? '#003087'
              : i === current
              ? '#003087'
              : '#CBD5E1',
            opacity: i === current ? 1 : i < current ? 0.6 : 0.35,
          }}
        />
      ))}
    </div>
  );
}
