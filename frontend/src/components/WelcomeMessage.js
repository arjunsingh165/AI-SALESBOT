import React, { useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const WelcomeContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[3],
}));

const WelcomeMessage = ({ username, onLoad }) => {
  useEffect(() => {
    const message = [
      '🌟 Welcome ' + username + '! 🌟',
      '',
      'I\'m your AI Sales Assistant, here to help you manage your products and sales.',
      '',
      '',
      '📦 PRODUCT MANAGEMENT',
      '-------------------',
      '',
      '• Add new products',
      '• Update existing products',
      '• Delete products',
      '• Search products',
      '• List all products',
      '• Show products by category',
      '',
      '',
      '🎯 EXAMPLE COMMANDS',
      '-----------------',
      '',
      '• "add product: laptop, 999.99, 10, electronics"',
      '• "search laptop"',
      '• "show all products"',
      '• "category electronics"',
      '',
      '',
      '💡 TIP: Type "help" to see all available commands!',
      '',
      '',
      'Need assistance? Just ask! 😊'
    ].join('\n');

    console.log('Welcome Message Content (with \\n):', message); // Debug log to see actual string

    onLoad({
      role: 'assistant',
      content: message,
      timestamp: new Date().toISOString()
    });
  }, [username, onLoad]);

  return null;
};

export default WelcomeMessage; 