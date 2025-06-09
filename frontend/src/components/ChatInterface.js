import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box,
    TextField,
    IconButton,
    Paper,
    Typography,
    CircularProgress,
    Button,
    Menu,
    MenuItem,
    Avatar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ChatInterface = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Initialize speech recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            recognitionRef.current = new window.webkitSpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
            };

            recognitionRef.current.onend = () => {
                setIsRecording(false);
                if (input.trim()) {
                    handleSubmit(new Event('submit'));
                }
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [input]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleSendMessage = useCallback(async (messageContent) => {
        if (!messageContent.trim()) return;

        const userMessage = {
            role: 'user',
            content: messageContent.trim()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage.content }),
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                const botMessage = {
                    role: 'assistant',
                    content: data.response
                };
                setMessages(prev => [...prev, botMessage]);
            } else {
                throw new Error('Failed to get response');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        
        const currentInput = input;
        setInput('');
        await handleSendMessage(currentInput);
    }, [input, handleSendMessage]);

    const handleVoiceInput = useCallback(() => {
        if (!recognitionRef.current) {
            alert('Speech recognition is not supported in your browser.');
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            setInput('');
            recognitionRef.current.start();
            setIsRecording(true);
        }
    }, [isRecording]);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Load chat history when component mounts
    useEffect(() => {
        const loadChatHistory = async () => {
            try {
                setMessages([]);
                
                const response = await fetch('http://localhost:5000/api/chat/history', {
                    credentials: 'include'
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.messages && data.messages.length > 0) {
                        setMessages(data.messages);
                    } else {
                        const welcomeMessage = {
                            role: 'assistant',
                            content: `🌟 Welcome ${user?.username || 'there'} to the Sales Chatbot! 🌟\n\n` +
                                'I\'m your AI-powered shopping assistant, ready to help you manage your products efficiently.\n\n' +
                                '🎯 Here\'s what I can do for you:\n\n' +
                                '📦 Product Management:\n' +
                                '   • Add new products\n' +
                                '   • Update existing products\n' +
                                '   • Remove products\n' +
                                '   • View all products\n\n' +
                                '🔍 Search & Filter:\n' +
                                '   • Search by product name\n' +
                                '   • Filter by category\n' +
                                '   • View product details\n\n' +
                                '🎤 Voice Commands:\n' +
                                '   • Click the microphone icon\n' +
                                '   • Speak your command clearly\n' +
                                '   • Click again to stop\n\n' +
                                '💡 Quick Tips:\n' +
                                '   • Use clear, specific commands\n' +
                                '   • Prices should be numbers\n' +
                                '   • Stock should be whole numbers\n' +
                                '   • Categories help organize products\n\n' +
                                '📝 Example Commands:\n' +
                                '   • "Add product: laptop, 999.99, 10, electronics"\n' +
                                '   • "Update product: laptop, price, 899.99"\n' +
                                '   • "Search laptop"\n' +
                                '   • "Show all products"\n\n' +
                                'How can I assist you today? 😊'
                        };
                        setMessages([welcomeMessage]);
                        await handleSendMessage(welcomeMessage.content);
                    }
                } else {
                    const welcomeMessage = {
                        role: 'assistant',
                        content: `🌟 Welcome ${user?.username || 'there'} to the Sales Chatbot! 🌟\n\n` +
                            'I\'m your AI-powered shopping assistant. How can I help you today?'
                    };
                    setMessages([welcomeMessage]);
                }
            } catch (error) {
                console.error('Error loading chat history:', error);
                setMessages([{
                    role: 'assistant',
                    content: `🌟 Welcome ${user?.username || 'there'} to the Sales Chatbot! 🌟\n\n` +
                        'I\'m your AI-powered shopping assistant. How can I help you today?'
                }]);
            }
        };

        loadChatHistory();
    }, [user, handleSendMessage]);

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
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
            {/* Header */}
            <Box
                sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: 'rgba(45, 45, 45, 0.95)',
                    borderBottom: '1px solid rgba(233, 30, 99, 0.2)',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        sx={{
                            bgcolor: 'rgba(233, 30, 99, 0.9)',
                            width: 40,
                            height: 40,
                        }}
                    >
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                    </Avatar>
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#FFFFFF',
                            fontWeight: 600,
                        }}
                    >
                        {user?.username || 'User'}
                    </Typography>
                </Box>
                <IconButton
                    onClick={handleMenuClick}
                    sx={{
                        color: '#FFFFFF',
                        '&:hover': {
                            bgcolor: 'rgba(233, 30, 99, 0.1)',
                        },
                    }}
                >
                    <MoreVertIcon />
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    sx={{
                        '& .MuiPaper-root': {
                            bgcolor: 'rgba(45, 45, 45, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(233, 30, 99, 0.2)',
                        },
                    }}
                >
                    <MenuItem
                        onClick={handleLogout}
                        sx={{
                            color: '#FFFFFF',
                            '&:hover': {
                                bgcolor: 'rgba(233, 30, 99, 0.1)',
                            },
                        }}
                    >
                        <LogoutIcon sx={{ mr: 1 }} />
                        Logout
                    </MenuItem>
                </Menu>
            </Box>

            {/* Chat Messages */}
            <Box
                sx={{
                    flex: 1,
                    overflow: 'auto',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}
            >
                {messages.map((message, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: 'flex',
                            justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                            mb: 2,
                        }}
                    >
                        <Paper
                            elevation={3}
                            sx={{
                                p: 2,
                                maxWidth: '70%',
                                bgcolor: message.role === 'user' 
                                    ? 'rgba(233, 30, 99, 0.9)' 
                                    : 'rgba(33, 150, 243, 0.9)',
                                color: 'white',
                                borderRadius: 2,
                                position: 'relative',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
                                    borderRadius: 'inherit',
                                    pointerEvents: 'none',
                                },
                            }}
                        >
                            <Typography
                                sx={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                                    fontSize: '1rem',
                                    lineHeight: 1.6,
                                }}
                            >
                                {message.content}
                            </Typography>
                        </Paper>
                    </Box>
                ))}
                <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    p: 2,
                    bgcolor: 'rgba(45, 45, 45, 0.95)',
                    borderTop: '1px solid rgba(233, 30, 99, 0.2)',
                    display: 'flex',
                    gap: 1,
                }}
            >
                <TextField
                    fullWidth
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    variant="outlined"
                    disabled={isLoading}
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
                        '& .MuiInputBase-input': {
                            color: '#FFFFFF',
                            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                            fontSize: '1rem',
                        },
                        '& .MuiInputLabel-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                        },
                    }}
                />
                <IconButton
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    sx={{
                        bgcolor: 'rgba(233, 30, 99, 0.9)',
                        color: 'white',
                        '&:hover': {
                            bgcolor: 'rgba(233, 30, 99, 1)',
                        },
                        '&.Mui-disabled': {
                            bgcolor: 'rgba(233, 30, 99, 0.3)',
                            color: 'rgba(255, 255, 255, 0.3)',
                        },
                    }}
                >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                </IconButton>
                <IconButton
                    onClick={handleVoiceInput}
                    sx={{
                        bgcolor: isRecording ? 'rgba(233, 30, 99, 0.9)' : 'rgba(33, 150, 243, 0.9)',
                        color: 'white',
                        '&:hover': {
                            bgcolor: isRecording ? 'rgba(233, 30, 99, 1)' : 'rgba(33, 150, 243, 1)',
                        },
                    }}
                >
                    <MicIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

export default ChatInterface; 