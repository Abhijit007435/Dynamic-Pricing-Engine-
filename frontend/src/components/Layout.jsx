import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, Tooltip } from '@mui/material';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import PriceChangeOutlinedIcon from '@mui/icons-material/PriceChangeOutlined';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { tokens } from '../theme';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 240;

const navItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardOutlinedIcon /> },
  { label: 'Products', path: '/products', icon: <StorefrontOutlinedIcon /> },
  { label: 'Inventory', path: '/inventory', icon: <Inventory2OutlinedIcon /> },
  { label: 'Competitor Pricing', path: '/competitor-pricing', icon: <ShowChartOutlinedIcon /> },
  { label: 'Pricing Recommendation', path: '/pricing-recommendation', icon: <PriceChangeOutlinedIcon /> },
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: tokens.surface,
            color: tokens.ink,
            borderRight: `1px solid ${tokens.structureSoft}`,
          },
        }}
      >
        <Box sx={{ p: 3, pb: 2 }}>
          <Typography variant="h6" sx={{ color: tokens.accent, fontWeight: 700, lineHeight: 1.2 }}>
            Pricing<br />Engine
          </Typography>
        </Box>
        <List sx={{ px: 1.5 }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <ListItemButton
                key={item.path}
                component={NavLink}
                to={item.path}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  color: active ? tokens.background : tokens.inkSoft,
                  backgroundColor: active ? tokens.accent : 'transparent',
                  transition: 'background-color 150ms ease, transform 150ms ease, color 150ms ease',
                  '&:hover': {
                    backgroundColor: active ? tokens.accent : tokens.structureSoft,
                    color: active ? tokens.background : tokens.ink,
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="sticky">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>
              Dynamic Pricing Engine
            </Typography>
            <Tooltip title="Logout">
              <IconButton onClick={handleLogout} sx={{ color: tokens.ink }}>
                <LogoutOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Box
          key={location.pathname}
          component="main"
          sx={{
            flexGrow: 1,
            p: 4,
            backgroundColor: tokens.background,
            animation: 'pageEnter 380ms ease-out',
            '@keyframes pageEnter': {
              '0%': { opacity: 0, transform: 'translateY(16px) scale(0.99)' },
              '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
