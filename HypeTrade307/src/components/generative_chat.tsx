//@ts-nocheck
import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import { API_BASE_URL } from "../config";

// Chat Container Styling
const ChatContainer = styled(Paper)(({ theme }) => ({
    position: 'fixed',
    bottom: 20,
    right: 20,
    width: 320,
    maxHeight: 480,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[8],
    overflow: 'hidden',
    zIndex: 1200,
}));

// Chat Header Styling
const ChatHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
}));

// Messages Container Styling
const MessagesContainer = styled(Box)(({ theme }) => ({
    padding: '16px',
    flexGrow: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '320px',
}));

// Message Styling
const Message = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'isUser'
})<{ isUser: boolean }>(({ theme, isUser }) => ({
    maxWidth: '80%',
    padding: '8px 12px',
    borderRadius: '16px',
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    backgroundColor: isUser
        ? theme.palette.primary.light
        : theme.vars
            ? `rgba(${theme.vars.palette.grey[300]})`
            : alpha(theme.palette.grey[300], 0.8),
    color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
    wordBreak: 'break-word',
}));

// Input Container Styling
const InputContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: '8px',
    borderTop: `1px solid ${theme.palette.divider}`,
}));

// Chat Button Styling
const ChatButton = styled(Button)(({ theme }) => ({
    position: 'fixed',
    bottom: 20,
    right: 20,
    borderRadius: '50%',
    minWidth: '56px',
    width: '56px',
    height: '56px',
    boxShadow: theme.shadows[4],
    zIndex: 1200,
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
    },
}));

// Disclaimer Text Styling
const Disclaimer = styled(Typography)(({ theme }) => ({
    fontSize: '0.7rem',
    color: theme.palette.text.secondary,
    textAlign: 'center',
    padding: '4px 8px',
    borderTop: `1px solid ${theme.palette.divider}`,
}));

// Word Counter Styling
const WordCounter = styled(Typography)(({ theme, error }) => ({
    fontSize: '0.75rem',
    color: error ? theme.palette.error.main : theme.palette.text.secondary,
    alignSelf: 'flex-end',
    margin: '2px 8px',
}));

interface Message {
    id: number;
    content: string;
    isUser: boolean;
    timestamp: Date;
}

const WORD_LIMIT = 50;

const ChatPopup: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            content: "Hello! How can I help you today?",
            isUser: false,
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Update word count when input changes
    useEffect(() => {
        const words = inputMessage.trim() ? inputMessage.trim().split(/\s+/) : [];
        setWordCount(words.length);
    }, [inputMessage]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
        // Clear any errors when toggling
        setShowError(false);
    };

    const handleClose = () => {
        setIsOpen(false);
        // Clear any errors when closing
        setShowError(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputMessage(e.target.value);
    };

    const handleSendMessage = async () => {
        if (inputMessage.trim() === '') return;

        // Check word count
        if (wordCount > WORD_LIMIT) {
            setErrorMessage(`Your message exceeds the ${WORD_LIMIT} word limit`);
            setShowError(true);
            return;
        }

        // Clear any previous errors
        setShowError(false);

        const userMessage: Message = {
            id: messages.length + 1,
            content: inputMessage,
            isUser: true,
            timestamp: new Date()
        };

        setMessages(prevMessages => [...prevMessages, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            // Call your endpoint and get response
            const response = await axios.post(`${API_BASE_URL}/chat/send`, {
                message: inputMessage
            });

            const botMessage: Message = {
                id: messages.length + 2,
                content: response.data.response, // Updated to match the response schema
                isUser: false,
                timestamp: new Date()
            };

            setMessages(prevMessages => [...prevMessages, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);

            let errorContent = "Sorry, I'm having trouble connecting. Please try again later.";

            // Check if it's a word limit error from the server
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                errorContent = error.response.data.detail || errorContent;
            }

            const errorMessage: Message = {
                id: messages.length + 2,
                content: errorContent,
                isUser: false,
                timestamp: new Date()
            };

            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const isOverWordLimit = wordCount > WORD_LIMIT;

    return (
        <>
            {!isOpen && (
                <ChatButton
                    variant="contained"
                    color="primary"
                    onClick={toggleChat}
                    aria-label="Open chat"
                >
                    <ChatIcon />
                </ChatButton>
            )}

            {isOpen && (
                <ChatContainer elevation={3}>
                    <ChatHeader>
                        <Typography variant="subtitle1" fontWeight="bold">Chat Support</Typography>
                        <IconButton size="small" onClick={handleClose} sx={{ color: 'inherit' }}>
                            <CloseIcon />
                        </IconButton>
                    </ChatHeader>

                    <MessagesContainer ref={messagesContainerRef}>
                        {messages.map((message) => (
                            <Box key={message.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: message.isUser ? 'flex-end' : 'flex-start' }}>
                                <Message isUser={message.isUser}>
                                    {message.content}
                                </Message>
                                <Typography variant="caption" sx={{ mt: 0.5, mx: 1, opacity: 0.7 }}>
                                    {formatTime(message.timestamp)}
                                </Typography>
                            </Box>
                        ))}
                        {isLoading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                <CircularProgress size={24} />
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </MessagesContainer>

                    <Collapse in={showError}>
                        <Alert severity="error" onClose={() => setShowError(false)}>
                            {errorMessage}
                        </Alert>
                    </Collapse>

                    <InputContainer>
                        <Box sx={{ display: 'flex', mb: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Type a message..."
                                value={inputMessage}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                variant="outlined"
                                error={isOverWordLimit}
                                sx={{ mr: 1 }}
                            />
                            <IconButton
                                color="primary"
                                onClick={handleSendMessage}
                                disabled={isLoading || inputMessage.trim() === '' || isOverWordLimit}
                            >
                                <SendIcon />
                            </IconButton>
                        </Box>
                        <WordCounter error={isOverWordLimit}>
                            {wordCount}/{WORD_LIMIT} words
                        </WordCounter>
                    </InputContainer>

                    <Disclaimer>
                        We are not responsible for anything from this conversation.
                    </Disclaimer>
                </ChatContainer>
            )}
        </>
    );
};

export default ChatPopup;