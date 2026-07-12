import { createTheme } from '@mui/material/styles';

/*
  DESIGN SYSTEM — Dynamic Pricing Engine (DARK THEME)
  ----------------------------------------
  Switched from light to dark. Since every page pulls colors from
  `tokens` below (not hardcoded hex), most pages update automatically
  just by this file changing — no need to touch Dashboard.jsx,
  ProductManagement.jsx, or teammate's pages individually.

  Colors:
    background      #0D0F14   near-black ink
    surface (cards)  #161922   dark card surface
    ink (text)       #F4F5F7   near-white
    structure        #5B7099   medium slate-blue (readable as text/icons
                                on dark bg, still reads as "brand navy")
    accent (gold)    #D9A441   slightly brighter gold for dark bg
    increase         #5FBE85   brighter green for dark bg
    decrease         #E07B63   brighter rust for dark bg

  Fonts unchanged: Sora (headings), Inter (body), JetBrains Mono (prices)
*/

export const tokens = {
  background: '#0D0F14',
  surface: '#161922',
  ink: '#F4F5F7',
  inkSoft: '#9AA0AC',
  structure: '#5B7099',
  structureSoft: 'rgba(91, 112, 153, 0.16)',
  accent: '#D9A441',
  accentSoft: 'rgba(217, 164, 65, 0.16)',
  increase: '#5FBE85',
  increaseSoft: 'rgba(95, 190, 133, 0.16)',
  decrease: '#E07B63',
  decreaseSoft: 'rgba(224, 123, 99, 0.16)',
};

const theme = createTheme({
  palette: {
    mode: 'dark',
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
      contrastText: '#0D0F14',
    },
    secondary: {
      main: tokens.accent,
      contrastText: '#0D0F14',
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
          backgroundImage: 'none',
          transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
            borderColor: tokens.accent,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'transform 150ms ease',
          '&:active': {
            transform: 'scale(0.97)',
          },
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
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 150ms ease',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: tokens.structureSoft,
        },
      },
    },
  },
});

export default theme;
