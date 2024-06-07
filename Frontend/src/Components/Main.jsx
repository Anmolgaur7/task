import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Box,
  TextField,
  Snackbar,
  Alert,
  Paper,
  IconButton
} from '@mui/material';
import { motion } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';
import CasinoIcon from '@mui/icons-material/Casino';
import LogoutIcon from '@mui/icons-material/Logout';

const App = () => {
  const [points, setPoints] = useState(5000);
  const [bet, setBet] = useState(100);
  const [choice, setChoice] = useState('7up');
  const [die1, setDie1] = useState(null);
  const [die2, setDie2] = useState(null);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [auth, setAuth] = useState({ token: null, user: null });
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    const storedAuth = JSON.parse(localStorage.getItem('auth'));
    if (storedAuth && storedAuth.token) {
      setAuth(storedAuth);
    }
  }, []);

  useEffect(() => {
    if (auth.token) {
      fetchPoints();
    }
  }, [auth.token]);

  const fetchPoints = async () => {
    try {
      const response = await axios.get('https://task-7.up.railway.app/points', {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setPoints(response.data.userPoints);
    } catch (error) {
      console.error('Error fetching points:', error);
    }
  };

  const handleRollDice = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://task-7.up.railway.app/roll',
        { bet, choice, id: auth.user.id },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      const { die1, die2, result, userPoints, payout } = response.data;
      setDie1(die1);
      setDie2(die2);
      setResult(result);
      setPoints(userPoints);
      setMessage(payout > 0 ? `You win ${payout} points!` : `You lose ${bet} points.`);
      setSnackbarMessage(payout > 0 ? `You win ${payout} points!` : `You lose ${bet} points.`);
      setSnackbarOpen(true);
      setLoading(false);
    } catch (error) {
      console.error('Error rolling dice:', error);
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    try {
      const url = isLogin ? 'https://task-7.up.railway.app/login' : 'https://task-7.up.railway.app/register';
      const payload = isLogin ? { Email: form.email, Password: form.password } : { Name: form.name, Email: form.email, Password: form.password };
      const response = await axios.post(url, payload);
      const userAuth = { token: response.data.token, user: response.data.user };
      setAuth(userAuth);
      localStorage.setItem('auth', JSON.stringify(userAuth));
    } catch (error) {
      console.error('Error during authentication:', error);
      setSnackbarMessage('Authentication failed');
      setSnackbarOpen(true);
    }
  };

  const handleLogout = () => {
    setAuth({ token: null, user: null });
    localStorage.removeItem('auth');
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="xs" style={{ textAlign: 'center', paddingTop: '20px',marginTop:"48px" }}>
      <Paper elevation={3} style={{ padding: '20px', borderRadius: '10px', }}>
        {auth.token ? (
          <>
          <Box display="flex" alignItems="center">
                <Typography variant="h5" gutterBottom>
                  Welcome, <b>{auth.user.name}</b>
                </Typography>
              </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              
              <Typography variant="h4" gutterBottom>
                7 Up 7 Down Game
              </Typography>
              <IconButton color="secondary" onClick={handleLogout}>
                <LogoutIcon />
              </IconButton>
            </Box>
            <Typography variant="h6" gutterBottom>
              Points: {points}
            </Typography>

            <FormControl fullWidth margin="normal">
              <InputLabel>Bet Amount</InputLabel>
              <Select value={bet} onChange={(e) => setBet(e.target.value)}>
                <MenuItem value={100}>100</MenuItem>
                <MenuItem value={200}>200</MenuItem>
                <MenuItem value={500}>500</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Choice</InputLabel>
              <Select value={choice} onChange={(e) => setChoice(e.target.value)}>
                <MenuItem value="7up">7 Up</MenuItem>
                <MenuItem value="7down">7 Down</MenuItem>
                <MenuItem value="7">Lucky 7</MenuItem>
              </Select>
            </FormControl>

            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleRollDice}
                disabled={loading}
                startIcon={<CasinoIcon />}
                fullWidth
                component={motion.div}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Roll Dice
              </Button>
            </Box>

            {loading && (
              <Box mt={2}>
                <CircularProgress />
              </Box>
            )}

            {result !== null && !loading && (
              <Box mt={2} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <Typography variant="h6">Dice 1: {die1}</Typography>
                <Typography variant="h6">Dice 2: {die2}</Typography>
                <Typography variant="h6">Result: {result}</Typography>
                <Typography variant="h6">{message}</Typography>
              </Box>
            )}
          </>
        ) : (
          <>
            <Typography variant="h4" gutterBottom>
              Welcome to 7 Up 7 Down Game
            </Typography>
            <Typography variant="body1" gutterBottom>
              Please {isLogin ? 'login' : 'register'} to play the game
            </Typography>

            <Typography variant="h5" style={{fontWeight:"bold",margin:"20px"}} gutterBottom>
              {isLogin ? 'Login' : 'Register'}
            </Typography>
            {!isLogin && (
              <TextField
                label="Name"
                fullWidth
                margin="normal"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            )}
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAuth}
                fullWidth
                component={motion.div}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLogin ? 'Login' : 'Register'}
              </Button>
              {
                !isLogin && (<h4>Once registration done go to login page</h4>)
              }
            </Box>
            <Box mt={2}>
              <Button
                variant="text"
                color="secondary"
                onClick={() => setIsLogin(!isLogin)}
                fullWidth
                component={motion.div}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLogin ? 'Need to register?' : 'Already have an account?'}
              </Button>
            </Box>
          </>
        )}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert onClose={handleSnackbarClose} severity="info">
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default App;
