import React, { useState, useEffect, useRef } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, CssBaseline, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import Navbar from "../components/NavbarSection/Navbar.tsx";
import AppTheme from "../components/shared-theme/AppTheme.tsx";
import './ChatPage.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface Message {
  text: string;
  timestamp: string;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null); // Track message index for deletion
  const [openDialog, setOpenDialog] = useState(false); // Track dialog visibility

  // Replace hardcoded WebSocket URL with API_BASE_URL
  const wsUrl = API_BASE_URL.replace('http', 'ws');
  const socket = new WebSocket(`${wsUrl}`);

  useEffect(() => {
    const storedMessages = localStorage.getItem('chatMessages');
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }

    socket.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    socket.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      console.log('Received new message:', newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    socket.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() !== "") {
      const newMessage: Message = {
        text: inputMessage,
        timestamp: new Date().toLocaleTimeString()
      };

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(newMessage));
      }

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputMessage("");
    }
  };

  const handleOpenDeleteDialog = (index: number) => {
    setDeleteIndex(index);
    setOpenDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDialog(false);
    setDeleteIndex(null);
  };

  const handleDeleteMessage = () => {
    if (deleteIndex !== null) {
      const updatedMessages = messages.filter((_, i) => i !== deleteIndex);
      setMessages(updatedMessages);
    }
    setOpenDialog(false);
    setDeleteIndex(null);
  };

  return (
    <AppTheme>
      <CssBaseline />
      <Navbar />

      <Container
        sx={{
          marginTop: '80px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center', padding: '20px', width: '1000px', margin: '0 auto' }}>
          <h1 style={{ color: '#333' }}>Chat</h1>

          <div
            style={{
              height: '500px',
              width: '1000px',
              overflowY: 'scroll',
              border: '1px solid #ccc',
              marginBottom: '16px',
              padding: '10px',
              borderRadius: '5px',
              backgroundColor: '#f9f9f9',
              textAlign: 'left',
            }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className="message-wrapper"
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #ddd',
                  color: '#333',
                  display: 'flex',
                  justifyContent: 'space-between',
                  position: 'relative',
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <strong>{message.timestamp}:</strong> {message.text}
                </div>

                <button
                  onClick={() => handleOpenDeleteDialog(index)}
                  className="delete-button"
                  style={{
                    background: 'red',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          <div>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message"
              style={{
                width: '300px',
                padding: '8px',
                borderRadius: '4px',
                marginRight: '8px',
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendMessage}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
              }}
            >
              Send
            </Button>
          </div>
        </Box>
      </Container>

      {/* Delete Confirmation Popup */}
      <Dialog open={openDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this message?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteMessage} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AppTheme>
  );
};

export default ChatPage;
