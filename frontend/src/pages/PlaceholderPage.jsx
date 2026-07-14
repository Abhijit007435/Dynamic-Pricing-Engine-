import { Box, Typography } from '@mui/material';
import { tokens } from '../theme';

export default function PlaceholderPage({ title }) {
  return (
    <Box sx={{ textAlign: 'center', mt: 10 }}>
      <Typography variant="h5" sx={{ color: tokens.inkSoft }}>{title}</Typography>
      <Typography variant="body2" sx={{ color: tokens.inkSoft, mt: 1 }}>
        This page is being built by Dev 2.
      </Typography>
    </Box>
  );
}
