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
      {/* LEFT PANEL — branding / context, tells the user what they're logging into */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          px: 8,
          backgroundColor: tokens.structure,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 4 }}>
            <PriceChangeOutlinedIcon sx={{ fontSize: 32, color: tokens.accent }} />
            <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: '"Sora", sans-serif' }}>
              Dynamic Pricing Engine
            </Typography>
          </Stack>

          <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: '"Sora", sans-serif', mb: 2, maxWidth: 440 }}>
            The admin console for smarter product pricing
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 5, maxWidth: 420 }}>
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
                    backgroundColor: 'rgba(201, 138, 44, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: tokens.accent,
                  }}
                >
                  {f.icon}
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                  {f.text}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* subtle decorative background circle, purely visual */}
        <Box
          sx={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.08)',
            top: -100,
            right: -150,
          }}
        />
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
          {/* Show the brand mark here too, for mobile users who don't see the left panel */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 4, display: { xs: 'flex', md: 'none' } }}>
            <PriceChangeOutlinedIcon sx={{ color: tokens.accent }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Dynamic Pricing Engine</Typography>
          </Stack>

          <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 700 }}>
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
                backgroundColor: tokens.structure,
                fontWeight: 600,
                '&:hover': { backgroundColor: '#1f2a3f' },
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
            <Typography variant="caption" sx={{ color: tokens.inkSoft }}>
              Username: <b>admin</b> &nbsp;·&nbsp; Password: <b>admin123</b>
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
