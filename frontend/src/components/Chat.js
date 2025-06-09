import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Avatar,
  Divider,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../contexts/AuthContext';
import { useSpeech } from '../hooks/useSpeech';
import chatbotLogo from '../assets/chatbot-logo.svg';
import chatbotIcon from '../assets/chatbot.svg';

const ChatContainer = styled(Container)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#1a1a1a',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  overflow: 'hidden',
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '4px',
    '&:hover': {
      background: 'rgba(255,255,255,0.3)',
    },
  },
}));

const MessageBubble = styled(Box)(({ theme, isUser }) => ({
  maxWidth: '80%',
  padding: theme.spacing(2),
  borderRadius: '12px',
  backgroundColor: isUser ? 'rgba(25, 118, 210, 0.1)' : 'rgba(255, 255, 255, 0.05)',
  border: `1px solid ${isUser ? 'rgba(25, 118, 210, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  color: '#ffffff',
  '&:hover': {
    backgroundColor: isUser ? 'rgba(25, 118, 210, 0.15)' : 'rgba(255, 255, 255, 0.08)',
  },
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiInputBase-input': {
    color: '#ffffff',
  },
}));

const TitleBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  borderRadius: '12px 12px 0 0',
  background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
}));

const ChatAvatar = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  marginRight: theme.spacing(2),
  backgroundColor: 'transparent',
  '& img': {
    width: '100%',
    height: '100%',
  },
}));

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const { user } = useAuth();
  const { speak, cancel, isSpeaking } = useSpeech();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const text = event.results[0][0].transcript;
        handleVoiceCommand(text);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setMessages(prev => [...prev, {
        text: 'Voice recognition is not supported in your browser.',
        isUser: false,
        timestamp: new Date().toISOString()
      }]);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        if (response.ok && data.products) {
          const uniqueCategories = [...new Set(data.products.map(p => p.category))];
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Add welcome message when component mounts
  useEffect(() => {
    setMessages([
      {
        text: "Hello! How can I help you today? I can assist you with:\n\n" +
              "1. Viewing products\n" +
              "2. Searching for specific products\n" +
              "3. Adding new products\n" +
              "4. Updating product details\n" +
              "5. Deleting products\n\n" +
              "Available categories:\n" +
              categories.map(cat => `- ${cat}`).join('\n') + "\n\n" +
              "To select a category, type: 'select category:CategoryName'\n" +
              "To view products in a category, type: 'show category:CategoryName'",
        isUser: false,
        timestamp: new Date().toISOString()
      }
    ]);
  }, [categories]);

  const handleProductCommand = async (message) => {
    const lowerMessage = message.toLowerCase().trim();
    
    try {
        // Select category
        if (lowerMessage.startsWith('select category:')) {
            const category = lowerMessage.split('select category:')[1].trim();
            if (categories.includes(category)) {
                setSelectedCategory(category);
                return `Selected category: ${category}`;
            }
            return `Category "${category}" not found. Available categories:\n${categories.join('\n')}`;
        }

        // Show products by category
        if (lowerMessage.startsWith('show category:')) {
            const category = lowerMessage.split('show category:')[1].trim();
            const response = await fetch(`/api/products/category/${encodeURIComponent(category)}`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch products');
            }
            const data = await response.json();
            
            if (data.products && data.products.length > 0) {
                return data.products.map(product => 
                    `${product.name} - Price: $${product.price} - Stock: ${product.stock}`
                ).join('\n');
            }
            return `No products found in category "${category}"`;
        }

        // List all products
        if (lowerMessage === 'list products' || lowerMessage === 'show products') {
            const response = await fetch('/api/products');
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch products');
            }
            const data = await response.json();
            
            if (data.products) {
                return data.products.map(product => 
                    `${product.name} - Price: $${product.price} - Stock: ${product.stock}`
                ).join('\n');
            }
            return 'No products found in inventory.';
        }

        // Show specific product
        if (lowerMessage.startsWith('show') || lowerMessage.startsWith('find') || lowerMessage.startsWith('search')) {
            const productName = lowerMessage.split(' ').slice(1).join(' ').trim();
            if (!productName) {
                return 'Please specify a product name. For example: "show iPhone" or "find iPhone"';
            }

            const response = await fetch(`/api/products/search?name=${encodeURIComponent(productName)}`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to search product');
            }
            const data = await response.json();
            
            if (data.products && data.products.length > 0) {
                const product = data.products[0];
                return `Product: ${product.name}\nPrice: $${product.price}\nStock: ${product.stock}\nCategory: ${product.category}`;
            }
            return `No product found with name "${productName}"`;
        }

        // Add product
        if (lowerMessage.startsWith('add')) {
            const params = lowerMessage.split(' ').slice(1).join(' ');
            const match = params.match(/name:([^ ]+) price:(\d+\.?\d*) category:([^ ]+) stock:(\d+)/i);
            
            if (!match) {
                return 'To add a product, use format: "add name:ProductName price:99.99 category:Category stock:10"';
            }

            const [, name, price, category, stock] = match;
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, price: parseFloat(price), category, stock: parseInt(stock) })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add product');
            }
            const data = await response.json();
            return `Product "${name}" added successfully!`;
        }

        // Update product
        if (lowerMessage.startsWith('update')) {
            const params = lowerMessage.split(' ').slice(1).join(' ');
            const match = params.match(/name:([^ ]+) (price:(\d+\.?\d*)|category:([^ ]+)|stock:(\d+))/i);
            
            if (!match) {
                return 'To update a product, use format:\n' +
                       '- "update name:ProductName price:99.99"\n' +
                       '- "update name:ProductName category:NewCategory"\n' +
                       '- "update name:ProductName stock:10"';
            }

            const [, name, , price, category, stock] = match;
            const updates = {};
            if (price) updates.price = parseFloat(price);
            if (category) updates.category = category;
            if (stock) updates.stock = parseInt(stock);

            const response = await fetch(`/api/products/update/${encodeURIComponent(name)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update product');
            }
            const data = await response.json();
            return `Product "${name}" updated successfully!`;
        }

        // Delete product
        if (lowerMessage.startsWith('delete')) {
            const productName = lowerMessage.split(' ').slice(1).join(' ').trim();
            if (!productName) {
                return 'Please specify a product name. For example: "delete iPhone"';
            }

            const response = await fetch(`/api/products/delete/${encodeURIComponent(productName)}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete product');
            }
            const data = await response.json();
            return `Product "${productName}" deleted successfully!`;
        }

        // Reduce stock
        if (lowerMessage.startsWith('reduce stock')) {
            const params = lowerMessage.split(' ').slice(2).join(' ');
            const match = params.match(/name:([^ ]+) amount:(\d+)/i);
            
            if (!match) {
                return 'To reduce stock, use format: "reduce stock name:ProductName amount:5"';
            }

            const [, name, amount] = match;
            const response = await fetch(`/api/products/reduce-stock/${encodeURIComponent(name)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: parseInt(amount) })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to reduce stock');
            }
            const data = await response.json();
            return `Reduced stock of "${name}" by ${amount}. New stock: ${data.stock}`;
        }

        return null;
    } catch (error) {
        console.error('API Error:', error);
        return `Error: ${error.message || 'Something went wrong. Please try again.'}`;
    }
};

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    const newUserMessage = {
      text: userMessage,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Check for product commands
      const productCommand = await handleProductCommand(userMessage);
      if (productCommand) {
        setMessages(prev => [...prev, {
          text: productCommand,
          isUser: false,
          timestamp: new Date().toISOString()
        }]);
        return;
      }

      // Send message to backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, {
          text: data.message,
          isUser: false,
          timestamp: new Date().toISOString()
        }]);
      } else {
        setMessages(prev => [...prev, {
          text: `Error: ${data.error || 'Something went wrong'}`,
          isUser: false,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        text: 'Error: Could not connect to the server',
        isUser: false,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceCommand = (text) => {
    const lowerText = text.toLowerCase();
    
    // Map voice commands to text commands
    if (lowerText.includes('show all products') || lowerText.includes('list all products')) {
      setInput('list products');
    } else if (lowerText.includes('show') || lowerText.includes('find') || lowerText.includes('search')) {
      const productName = lowerText.split('show').pop().split('find').pop().split('search').pop().trim();
      setInput(`show ${productName}`);
    } else if (lowerText.includes('add product')) {
      const params = lowerText.split('add product').pop().trim();
      setInput(`add ${params}`);
    } else if (lowerText.includes('update product')) {
      const params = lowerText.split('update product').pop().trim();
      setInput(`update ${params}`);
    } else if (lowerText.includes('delete product')) {
      const productName = lowerText.split('delete product').pop().trim();
      setInput(`delete ${productName}`);
    } else {
      setInput(text);
    }
  };

  return (
    <Container maxWidth="md" sx={{ height: '100vh', py: 2 }}>
      <ChatContainer elevation={3}>
        <TitleBar>
          <ChatAvatar src={chatbotIcon} alt="Chatbot" />
          <Box>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              Sales Assistant
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Your AI-powered shopping guide
            </Typography>
          </Box>
        </TitleBar>

        <MessagesContainer>
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              isUser={message.isUser}
              sx={{
                animation: 'fadeIn 0.3s ease-in-out',
                '@keyframes fadeIn': {
                  '0%': { opacity: 0, transform: 'translateY(10px)' },
                  '100%': { opacity: 1, transform: 'translateY(0)' }
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                {!message.isUser && (
                  <ChatAvatar src={chatbotIcon} alt="Chatbot" sx={{ width: 32, height: 32 }} />
                )}
                <Box>
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-line',
                      wordBreak: 'break-word',
                      lineHeight: 1.5,
                      color: '#ffffff'
                    }}
                  >
                    {message.text}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: '0.75rem'
                    }}
                  >
                    {formatTimestamp(message.timestamp)}
                  </Typography>
                </Box>
              </Box>
            </MessageBubble>
          ))}
          <div ref={messagesEndRef} />
        </MessagesContainer>

        <InputContainer>
          <StyledTextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <Tooltip title={isListening ? "Stop listening" : "Start voice input"}>
            <IconButton
              onClick={toggleListening}
              color={isListening ? "error" : "primary"}
              sx={{
                ml: 1,
                backgroundColor: isListening ? 'rgba(211, 47, 47, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                '&:hover': {
                  backgroundColor: isListening ? 'rgba(211, 47, 47, 0.2)' : 'rgba(25, 118, 210, 0.2)',
                },
              }}
            >
              <MicIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Send message">
            <IconButton
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              color="primary"
              sx={{
                ml: 1,
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.2)',
                },
              }}
            >
              {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
            </IconButton>
          </Tooltip>
        </InputContainer>
      </ChatContainer>
    </Container>
  );
};

export default Chat; 