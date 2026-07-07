import { Box, Typography } from '@mui/material';
import { tokens } from '../theme';

/*
  PriceTag — the signature visual element of this app.
  Every price anywhere in the app should use this component so numbers
  always look like they're read off a ledger: monospace, tabular figures,
  consistent weight. Share this component with the Dev 2 pages too.

  Usage:
  <PriceTag value={799} />
  <PriceTag value={879} variant="accent" size="large" />
*/

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
