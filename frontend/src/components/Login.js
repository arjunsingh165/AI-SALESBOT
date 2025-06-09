import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Container,
    Alert,
    Tabs,
    Tab,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) {
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate form data
        if (isLogin) {
            if (!formData.username || !formData.password) {
                setError('Username and password are required');
                return;
            }
        } else {
            if (!formData.username || !formData.password || !formData.email) {
                setError('All fields are required for registration');
                return;
            }
            if (!formData.email.includes('@')) {
                setError('Please enter a valid email address');
                return;
            }
        }

        try {
            if (isLogin) {
                const response = await fetch('http://localhost:5000/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: formData.username,
                        password: formData.password
                    }),
                    credentials: 'include'
                });

                const data = await response.json();

                if (response.ok) {
                    login(data.user);
                    navigate('/chat');
                } else {
                    setError(data.error || 'Login failed. Please check your credentials.');
                }
            } else {
                const response = await fetch('http://localhost:5000/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: formData.username,
                        email: formData.email,
                        password: formData.password
                    }),
                    credentials: 'include'
                });

                const data = await response.json();

                if (response.ok) {
                    login(data.user);
                    navigate('/chat');
                } else {
                    setError(data.error || 'Registration failed. Please try again.');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#1A1A1A',
                background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(45, 45, 45, 0.9) 100%), url("https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at center, rgba(233, 30, 99, 0.1) 0%, rgba(33, 150, 243, 0.1) 100%)',
                    pointerEvents: 'none',
                },
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        bgcolor: 'rgba(45, 45, 45, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(233, 30, 99, 0.2)',
                        borderRadius: 2,
                        position: 'relative',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(45deg, rgba(233, 30, 99, 0.05) 0%, rgba(33, 150, 243, 0.05) 100%)',
                            borderRadius: 'inherit',
                            pointerEvents: 'none',
                        },
                    }}
                >
                    <Box
                        sx={{
                            width: 100,
                            height: 100,
                            mb: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'rgba(33, 150, 243, 0.9)',
                            borderRadius: '50%',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                            border: '3px solid rgba(233, 30, 99, 0.3)',
                            position: 'relative',
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: -2,
                                left: -2,
                                right: -2,
                                bottom: -2,
                                borderRadius: '50%',
                                background: 'linear-gradient(45deg, rgba(233, 30, 99, 0.3) 0%, rgba(33, 150, 243, 0.3) 100%)',
                                zIndex: -1,
                            },
                        }}
                    >
                        <span role="img" aria-label="robot" style={{ fontSize: '3rem' }}>🤖</span>
                    </Box>
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{
                            mb: 3,
                            fontWeight: 600,
                            background: 'linear-gradient(45deg, #E91E63 30%, #2196F3 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textAlign: 'center',
                        }}
                    >
                        Sales Chatbot
                    </Typography>

                    <Tabs
                        value={isLogin ? 0 : 1}
                        onChange={(e, newValue) => {
                            setIsLogin(newValue === 0);
                            setError(''); // Clear error when switching tabs
                        }}
                        centered
                        sx={{
                            mb: 3,
                            '& .MuiTab-root': {
                                color: 'rgba(255, 255, 255, 0.7)',
                                '&.Mui-selected': {
                                    color: '#E91E63',
                                },
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#E91E63',
                            },
                        }}
                    >
                        <Tab label="Login" />
                        <Tab label="Register" />
                    </Tabs>

                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ 
                                width: '100%', 
                                mb: 2,
                                bgcolor: 'rgba(211, 47, 47, 0.1)',
                                color: '#FF8A80',
                                '& .MuiAlert-icon': {
                                    color: '#FF8A80',
                                },
                            }}
                        >
                            {error}
                        </Alert>
                    )}
                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            error={error && !formData.username}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    color: '#FFFFFF',
                                    '& fieldset': {
                                        borderColor: 'rgba(233, 30, 99, 0.3)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(233, 30, 99, 0.5)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#E91E63',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'rgba(255, 255, 255, 0.7)',
                                },
                            }}
                        />
                        {!isLogin && (
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={error && !formData.email}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                                        color: '#FFFFFF',
                                        '& fieldset': {
                                            borderColor: 'rgba(233, 30, 99, 0.3)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(233, 30, 99, 0.5)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#E91E63',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(255, 255, 255, 0.7)',
                                    },
                                }}
                            />
                        )}
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            error={error && !formData.password}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    color: '#FFFFFF',
                                    '& fieldset': {
                                        borderColor: 'rgba(233, 30, 99, 0.3)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(233, 30, 99, 0.5)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#E91E63',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'rgba(255, 255, 255, 0.7)',
                                },
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                mt: 3,
                                mb: 2,
                                py: 1.5,
                                bgcolor: 'rgba(233, 30, 99, 0.9)',
                                '&:hover': {
                                    bgcolor: 'rgba(233, 30, 99, 1)',
                                },
                            }}
                        >
                            {isLogin ? 'Login' : 'Register'}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login; 