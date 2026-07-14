import { Box, Typography } from '@mui/material';
import { tokens } from '../theme';

const colorMap = {
  default: tokens.ink,
  accent: tokens.accent,
  increase: tokens.increase,
  decrease: tokens.decrease,
};

const sizeMap = {
  small: '0.95rem',
  medium: '1.25rem',
  large: '2rem',
};

export default function PriceTag({ value, variant = 'default', size = 'medium', prefix = '₹' }) {
  return (
    <Typography
      component="span"
      sx={{
        fontFamily: '"JetBrains Mono", monospace',
        fontVariantNumeric: 'tabular-nums',
        fontWeight: 600,
        fontSize: sizeMap[size] || sizeMap.medium,
        color: colorMap[variant] || colorMap.default,
      }}
    >
      {prefix}
      {Number(value).toLocaleString('en-IN')}
    </Typography>
  );
}
