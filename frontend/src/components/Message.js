import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const MessageContainer = styled(Paper)(({ theme, isuser }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  maxWidth: '80%',
  backgroundColor: isuser ? theme.palette.primary.main : theme.palette.grey[100],
  color: isuser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  alignSelf: isuser ? 'flex-end' : 'flex-start',
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[1],
}));

const Message = ({ content, role, timestamp }) => {
  const isUser = role === 'user';
  const formattedTime = new Date(timestamp).toLocaleTimeString();

  // Split content into lines and create Typography components for each line
  const formattedContent = content.split('\n').map((line, index) => (
    <Typography 
      key={index} 
      variant="body1" 
      sx={{ 
        whiteSpace: 'pre-wrap',
        mb: line.trim() === '' ? 1 : 0.5,
        fontFamily: 'monospace',
        lineHeight: 1.5
      }}
    >
      {line}
    </Typography>
  ));

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      <MessageContainer isuser={isUser}>
        <Box sx={{ whiteSpace: 'pre-wrap' }}>
          {formattedContent}
        </Box>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 1,
            opacity: 0.7,
            textAlign: isUser ? 'right' : 'left',
          }}
        >
          {formattedTime}
        </Typography>
      </MessageContainer>
    </Box>
  );
};

export default Message; 