import { createTheme } from '@mui/material/styles';

/*
  DESIGN SYSTEM — Dynamic Pricing Engine
  ----------------------------------------
  Signature idea: this is a PRICING tool, so every price/number in the app
  is rendered in a monospace font with tabular figures — like a ledger or
  trading terminal readout. This is what makes it feel distinct instead of
  a generic MUI dashboard. Keep this rule consistent across BOTH frontend
  devs' pages: numbers = monospace, everything else = Inter/Sora.

  Colors:
    background      #FAFAF8   soft warm off-white (not stark white)
    surface (cards)  #FFFFFF
    ink (text)       #14171F
    structure        #2B3A55   deep indigo — nav, headers, borders
    accent (gold)    #C98A2C   used ONLY for prices/recommendations
    increase         #3F7D58   muted green
    decrease         #B4533C   muted rust

  Fonts:
    Display/headings: Sora
    Body/UI text:      Inter
    Numbers/prices:    JetBrains Mono (always tabular-nums)
*/

export const tokens = {
  background: '#FAFAF8',
  surface: '#FFFFFF',
  ink: '#14171F',
  inkSoft: '#5B5F6B',
  structure: '#2B3A55',
  structureSoft: '#E7E9EE',
  accent: '#C98A2C',
  accentSoft: '#F6E9D3',
  increase: '#3F7D58',
  increaseSoft: '#E4F0E8',
  decrease: '#B4533C',
  decreaseSoft: '#F6E4DF',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: tokens.background,
      paper: tokens.surface,
    },
    text: {
      primary: tokens.ink,
      secondary: tokens.inkSoft,
    },
    primary: {
      main: tokens.structure,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: tokens.accent,
      contrastText: '#14171F',
    },
    success: {
      main: tokens.increase,
    },
    error: {
      main: tokens.decrease,
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: { fontFamily: '"Sora", sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Sora", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Sora", sans-serif', fontWeight: 600 },
    h4: { fontFamily: '"Sora", sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Sora", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Sora", sans-serif', fontWeight: 600 },
    button: { fontFamily: '"Inter", sans-serif', fontWeight: 600, textTransform: 'none' },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: `1px solid ${tokens.structureSoft}`,
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.surface,
          color: tokens.ink,
          boxShadow: 'none',
          borderBottom: `1px solid ${tokens.structureSoft}`,
        },
      },
    },
  },
});

export default theme;
