import { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PriceChangeOutlinedIcon from '@mui/icons-material/PriceChangeOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import { useAuth } from '../context/AuthContext';
import { tokens } from '../theme';

const features = [
  { icon: <TrendingUpOutlinedIcon />, text: 'Rule-based pricing recommendations' },
  { icon: <Inventory2OutlinedIcon />, text: 'Real-time inventory tracking' },
  { icon: <ShowChartOutlinedIcon />, text: 'Competitor price comparison' },
];

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const result = login(username, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* LEFT PANEL — branding / context */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          px: 8,
          backgroundColor: tokens.surface,
          borderRight: `1px solid ${tokens.structureSoft}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 4 }}>
          <PriceChangeOutlinedIcon sx={{ fontSize: 32, color: tokens.accent }} />
          <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: '"Sora", sans-serif', color: tokens.ink }}>
            Dynamic Pricing Engine
          </Typography>
        </Stack>

        <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: '"Sora", sans-serif', mb: 2, maxWidth: 440, color: tokens.ink }}>
          The admin console for smarter product pricing
        </Typography>
        <Typography variant="body1" sx={{ color: tokens.inkSoft, mb: 5, maxWidth: 420 }}>
          Manage products, track inventory, monitor competitors, and get
          automated pricing recommendations — all from one dashboard.
        </Typography>

        <Stack spacing={2.5}>
          {features.map((f, i) => (
            <Stack key={i} direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: tokens.accentSoft,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: tokens.accent,
                }}
              >
                {f.icon}
              </Box>
              <Typography variant="body2" sx={{ color: tokens.inkSoft }}>
                {f.text}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* RIGHT PANEL — the actual login form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: tokens.background,
          px: 4,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 380 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 4, display: { xs: 'flex', md: 'none' } }}>
            <PriceChangeOutlinedIcon sx={{ color: tokens.accent }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: tokens.ink }}>Dynamic Pricing Engine</Typography>
          </Stack>

          <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 700, color: tokens.ink }}>
            Welcome back
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.inkSoft, mb: 4 }}>
            Sign in to your admin account to continue
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              autoFocus
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                mt: 1,
                py: 1.4,
                backgroundColor: tokens.accent,
                color: tokens.background,
                fontWeight: 600,
                transition: 'transform 150ms ease, box-shadow 150ms ease',
                '&:hover': {
                  backgroundColor: tokens.accent,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 20px ${tokens.accentSoft}`,
                },
              }}
            >
              Sign In
            </Button>
          </Box>

          <Paper
            variant="outlined"
            sx={{
              mt: 4,
              p: 2,
              backgroundColor: tokens.accentSoft,
              borderColor: tokens.accent,
            }}
          >
            <Typography variant="caption" sx={{ color: tokens.ink, display: 'block', fontWeight: 600, mb: 0.3 }}>
              Demo credentials
            </Typography>
            <Typography variant="caption" sx={{ color: tokens.inkSoft, display: 'block' }}>
              Username: <b>admin</b> &nbsp;·&nbsp; Password: <b>admin123</b>
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
