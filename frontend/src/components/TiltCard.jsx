import { useRef, useState } from 'react';
import { Box } from '@mui/material';

/*
  TiltCard — wraps any content and gives it a 3D tilt effect that follows
  the mouse, plus a subtle glossy "shine" that moves with the cursor.

  Usage:
  <TiltCard>
    <StatCard ... />
  </TiltCard>

  How it works: as the mouse moves over the card, we calculate how far
  the cursor is from the center (as a percentage), and use that to rotate
  the card slightly on the X/Y axis — like the card is physically tilting
  toward the cursor. On mouse leave, it smoothly resets to flat.
*/
export default function TiltCard({ children, maxTilt = 12, glare = true }) {
  const ref = useRef(null);
  const [transform, setTransform] = useState('perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)');
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const percentX = x / rect.width;
    const percentY = y / rect.height;

    const rotateY = (percentX - 0.5) * maxTilt * 2;
    const rotateX = (0.5 - percentY) * maxTilt * 2;

    setTransform(
      `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`
    );
    setGlarePos({ x: percentX * 100, y: percentY * 100, opacity: 0.25 });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)');
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <Box
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      sx={{
        position: 'relative',
        transform,
        transition: 'transform 150ms ease-out',
        transformStyle: 'preserve-3d',
        cursor: 'pointer',
        '& > *': {
          height: '100%',
        },
      }}
    >
      {children}
      {glare && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.8) 0%, transparent 60%)`,
            opacity: glarePos.opacity,
            transition: 'opacity 200ms ease',
          }}
        />
      )}
    </Box>
  );
}
