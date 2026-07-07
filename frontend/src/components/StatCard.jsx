import { Paper, Box, Typography } from '@mui/material';
import { tokens } from '../theme';

export default function StatCard({ label, value, icon, accent = false }) {
  return (
    <Paper sx={{ p: 3, flex: 1, minWidth: 200 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ color: tokens.inkSoft, fontWeight: 500 }}>
          {label}
        </Typography>
        {icon && (
          <Box sx={{ color: accent ? tokens.accent : tokens.structure, opacity: 0.8 }}>{icon}</Box>
        )}
      </Box>
      <Typography
        sx={{
          mt: 1,
          fontFamily: '"JetBrains Mono", monospace',
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 700,
          fontSize: '1.8rem',
          color: accent ? tokens.accent : tokens.ink,
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
}
