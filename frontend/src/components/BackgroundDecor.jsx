import { Box } from '@mui/material';
import { tokens } from '../theme';

/*
  BackgroundDecor — a subtle, slow-drifting gradient + fine dot-grid
  background. Ties into the "ledger / pricing chart" theme of the app
  without being distracting (this is an admin tool, not a landing page).

  Usage: place as the FIRST child inside a position:relative container,
  with position:absolute, inset:0, zIndex:0 — content goes on top with
  position:relative, zIndex:1.

  variant="light"  → for light backgrounds (Dashboard, most pages)
  variant="dark"   → for the dark indigo panel (Login/Signup left side)
*/
export default function BackgroundDecor({ variant = 'light' }) {
  const isDark = variant === 'dark';

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* Fine dot grid, like graph paper — reinforces the "data/pricing" feel */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(43,58,85,0.14)'} 1.5px, transparent 1.5px)`,
          backgroundSize: '22px 22px',
        }}
      />

      {/* Drifting gradient blob 1 */}
      <Box
        sx={{
          position: 'absolute',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: isDark
            ? `radial-gradient(circle, ${tokens.accent}55 0%, transparent 70%)`
            : `radial-gradient(circle, ${tokens.accent}40 0%, transparent 70%)`,
          top: '-15%',
          right: '-8%',
          animation: 'drift1 18s ease-in-out infinite',
          '@keyframes drift1': {
            '0%, 100%': { transform: 'translate(0, 0)' },
            '50%': { transform: 'translate(-40px, 50px)' },
          },
        }}
      />

      {/* Drifting gradient blob 2 */}
      <Box
        sx={{
          position: 'absolute',
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: isDark
            ? `radial-gradient(circle, ${tokens.structureSoft}40 0%, transparent 70%)`
            : `radial-gradient(circle, ${tokens.structure}30 0%, transparent 70%)`,
          bottom: '-10%',
          left: '-8%',
          animation: 'drift2 24s ease-in-out infinite',
          '@keyframes drift2': {
            '0%, 100%': { transform: 'translate(0, 0)' },
            '50%': { transform: 'translate(50px, -40px)' },
          },
        }}
      />
    </Box>
  );
}
