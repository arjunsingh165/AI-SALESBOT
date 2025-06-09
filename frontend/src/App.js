import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  useTheme,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import { 
  Send as SendIcon, 
  Mic as MicIcon, 
  MicOff as MicOffIcon,
  AccountCircle,
  Logout as LogoutIcon,
  ShoppingCart,
  Store,
  Analytics
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import salesBackground from './assets/sales-background.jpg';
import WelcomeMessage from './components/WelcomeMessage';

// Custom theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff9d',
      light: '#66ffc2',
      dark: '#00cc7d',
    },
    secondary: {
      main: '#ff4081',
      light: '#ff79b0',
      dark: '#c60055',
    },
    background: {
      default: '#000000',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
    },
    button: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
  },
});

// Styled components
const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  width: '100vw',
  maxWidth: '100vw !important',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  background: `linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.95)), url(${salesBackground})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  color: theme.palette.text.primary,
}));

const LoginContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100vw',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  background: `linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.95)), url(${salesBackground})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
}));

const LoginPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: '100%',
  maxWidth: '400px',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  borderRadius: theme.spacing(2),
  boxShadow: '0 0 20px rgba(0, 255, 157, 0.2)',
}));

const BrandContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
}));

const BrandName = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 'bold',
  marginBottom: theme.spacing(1),
}));

const Tagline = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

const SwitchAccountText = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const ChatContainer = styled(Box)(({ theme }) => ({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  gap: theme.spacing(2),
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: 'rgba(26, 26, 26, 0.95)',
  borderRadius: theme.spacing(2),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.primary.main}30`,
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
}));

const ChatMessages = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  backgroundColor: 'rgba(26, 26, 26, 0.7)',
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  boxShadow: 'inset 0 0 10px rgba(0, 255, 157, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.primary.main,
    borderRadius: '10px',
    border: '2px solid rgba(0, 0, 0, 0.3)',
  },
}));

const MessageBubble = styled(Box)(({ theme, isUser }) => ({
  maxWidth: '80%',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  backgroundColor: isUser ? theme.palette.primary.main : 'rgba(26, 26, 26, 0.95)',
  color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  transition: 'all 0.3s ease',
  border: isUser ? 'none' : `1px solid ${theme.palette.primary.main}30`,
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },
  whiteSpace: 'pre-wrap',
}));

const ChatInput = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'rgba(26, 26, 26, 0.95)',
  borderRadius: theme.spacing(2),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.primary.main}30`,
  display: 'flex',
  gap: theme.spacing(1),
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
}));

const GlowingText = styled(Typography)(({ theme }) => ({
  textShadow: '0 0 10px rgba(0, 255, 157, 0.5)',
  animation: 'glow 2s ease-in-out infinite alternate',
  '@keyframes glow': {
    from: {
      textShadow: '0 0 10px rgba(0, 255, 157, 0.5)',
    },
    to: {
      textShadow: '0 0 20px rgba(0, 255, 157, 0.8), 0 0 30px rgba(0, 255, 157, 0.6)',
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  textTransform: 'none',
  padding: theme.spacing(1.5, 3),
  transition: 'all 0.3s ease',
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s ease',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    },
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}40`,
    },
  },
}));

const UserInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  '& .MuiTypography-root': {
    fontWeight: 600,
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  backgroundColor: 'rgba(0, 255, 157, 0.1)',
  '& svg': {
    color: theme.palette.primary.main,
  },
}));

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:5000/api/chat/history', {
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          if (data.messages) {
            setMessages(data.messages);
          }
        })
        .catch(err => console.error('Error fetching chat history:', err));
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsLoggedIn(true);
        setCurrentUser(data.user);
        setMessages([]); // Clear messages when logging in
        setHasShownWelcome(false); // Reset welcome message flag on new login
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during login');
    }
    setIsLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsLoggedIn(true);
        setCurrentUser(data.user);
        setMessages([]); // Clear messages when registering
        setHasShownWelcome(false); // Reset welcome message flag on new registration
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during registration');
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear token on logout
    setIsLoggedIn(false);
    setCurrentUser(null);
    setMessages([]);
    setUsername('');
    setPassword('');
    setEmail('');
    setIsRegistering(false);
    setHasShownWelcome(false); // Reset welcome message flag on logout
  };

  const handleSendMessage = async (e) => {
    if (e) {
      e.preventDefault(); // Only call preventDefault if an event object exists
    }
    console.log('handleSendMessage called. inputMessage:', inputMessage); // Debug log
    if (!inputMessage.trim()) return;

    // Add user message to chat
    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ message: inputMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.response) {
          // Add assistant response to chat
          const assistantMessage = {
            role: 'assistant',
            content: data.response,
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, assistantMessage]);
        }
      } else {
        const error = await response.json();
        console.error('Error:', error);
        // Add error message to chat
        const errorMessage = {
          role: 'assistant',
          content: '❌ Sorry, there was an error processing your request. Please try again.',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      // Add error message to chat
      const errorMessage = {
        role: 'assistant',
        content: '❌ Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input is not supported in your browser');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsListening(false);
      // Automatically send the voice input as a message
      handleSendMessage(null); // Call send message after voice input
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleWelcomeMessage = (message) => {
    // Append the welcome message, do not overwrite history
    setMessages(prev => [...prev, message]);
    setHasShownWelcome(true); // Set flag to true after message is displayed
  };

  if (!isLoggedIn) {
    return (
      <ThemeProvider theme={darkTheme}>
        <StyledContainer>
          <LoginContainer>
            <LoginPaper elevation={3}>
              <BrandContainer>
                <IconWrapper sx={{ display: 'inline-flex', mb: 2 }}>
                  <Store sx={{ fontSize: 40 }} />
                </IconWrapper>
                <BrandName variant="h3" component="h1">
                  SalesBot AI
                </BrandName>
                <Tagline variant="subtitle1">
                  Your Intelligent Sales Management Assistant
                </Tagline>
              </BrandContainer>

              <form onSubmit={isRegistering ? handleRegister : handleLogin}>
                <StyledTextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  margin="normal"
                  required
                  sx={{ mb: 2 }}
                />
                {isRegistering && (
                  <StyledTextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                    required
                    sx={{ mb: 2 }}
                  />
                )}
                <StyledTextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                  sx={{ mb: 3 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <SwitchAccountText
                    onClick={() => setIsRegistering(!isRegistering)}
                    sx={{ cursor: 'pointer' }}
                  >
                    {isRegistering ? 'Already have an account?' : 'Create new account'}
                  </SwitchAccountText>
                  <StyledButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isLoading}
                  >
                    {isLoading ? <CircularProgress size={24} /> : (isRegistering ? 'Register' : 'Login')}
                  </StyledButton>
                </Box>
              </form>
            </LoginPaper>
          </LoginContainer>
        </StyledContainer>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <StyledContainer>
        <ChatContainer>
          <ChatHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconWrapper>
                <Store sx={{ fontSize: 32 }} />
              </IconWrapper>
              <GlowingText variant="h5">
                SalesBot Assistant
              </GlowingText>
            </Box>
            <UserInfo>
              <IconWrapper>
                <ShoppingCart sx={{ fontSize: 24 }} />
              </IconWrapper>
              <Typography variant="body1">
                {currentUser?.username}
              </Typography>
              <IconButton 
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 255, 157, 0.1)',
                  },
                }}
              >
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                PaperProps={{
                  sx: {
                    backgroundColor: 'background.paper',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'primary.main',
                  },
                }}
              >
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1, color: 'primary.main' }} />
                  Logout
                </MenuItem>
              </Menu>
            </UserInfo>
          </ChatHeader>

          <ChatMessages>
            {/* Welcome message now handled by WelcomeMessage component */}
            {isLoggedIn && currentUser && !hasShownWelcome && ( // Only render WelcomeMessage if not yet shown
              <WelcomeMessage 
                username={currentUser?.username} 
                onLoad={handleWelcomeMessage} 
              />
            )}
            {messages.map((message, index) => (
              <MessageBubble
                key={index}
                isUser={message.role === 'user'}
                timestamp={message.timestamp}
              >
                {message.content}
              </MessageBubble>
            ))}
            <div ref={messagesEndRef} />
          </ChatMessages>

          <ChatInput>
            <StyledTextField
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
                console.log('Input field changed. Current inputMessage:', e.target.value); // Debug log
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  console.log('Enter key pressed. Current inputMessage (onKeyPress):', inputMessage);
                  handleSendMessage(e);
                }
              }}
              placeholder="Type your message..."
              fullWidth
              multiline
              maxRows={4}
              sx={{ mr: 2 }}
            />
            <IconButton 
              onClick={() => {
                console.log('Send button clicked. Current inputMessage (onClick):', inputMessage);
                handleSendMessage(null); // Pass null as event since it's a button click
              }}
              disabled={!inputMessage.trim()}
              sx={{
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(0, 255, 157, 0.1)',
                },
              }}
            >
              <SendIcon />
            </IconButton>
            <IconButton
              onClick={handleVoiceInput}
              sx={{
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(0, 255, 157, 0.1)',
                },
              }}
            >
              <MicIcon />
            </IconButton>
          </ChatInput>
        </ChatContainer>
      </StyledContainer>
    </ThemeProvider>
  );
}

export default App; 