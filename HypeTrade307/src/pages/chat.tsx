import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, CssBaseline, Box } from '@mui/material';
import Navbar from "../components/NavbarSection/Navbar.tsx";  // Ensure this import is correct
import AppTheme from "../components/shared-theme/AppTheme.tsx";  // Ensure this import is correct
import './ChatPage.css';  // Import the CSS file

// Define a type for the message structure
interface Message {
  text: string;
  timestamp: string;
}
//TODO: Make the chats update automatically using the server. currently refreshes are necessary to see chats.
const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Load messages from localStorage when the component mounts
  useEffect(() => {
    const storedMessages = localStorage.getItem('chatMessages');
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }

    // Connect to WebSocket server
    const socket = new WebSocket('ws://localhost:8080');
    setWs(socket);

    socket.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    socket.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      console.log('Received new message:', newMessage);  // Debug log
      setMessages((prevMessages) => [...prevMessages, newMessage]);  // Properly append new message
    };

    socket.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    return () => {
      socket.close(); // Cleanup WebSocket connection on component unmount
    };
  }, []);

  // Save messages to localStorage whenever they change
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

      // Send message to WebSocket server
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(newMessage));
      }

      // Add the new message locally
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputMessage("");
    }
  };

  const handleDeleteMessage = (index: number) => {
    const updatedMessages = messages.filter((_, i) => i !== index);
    setMessages(updatedMessages);
  };

  return (
    <AppTheme>
      <CssBaseline />
      <Navbar />

      <Container
        sx={{
          marginTop: '80px',
          display: 'flex',
          justifyContent: 'center', // Center the container horizontally
        }}
      >
        <Box sx={{ textAlign: 'center', padding: '20px', width: '1000px', margin: '0 auto' }}>
          <h1 style={{ color: '#333' }}>Chat</h1>

          {/* Chat Messages */}
          <div
            style={{
              height: '500px',
              width: '1000px',  // Fixed width
              overflowY: 'scroll',
              border: '1px solid #ccc',
              marginBottom: '16px',
              padding: '10px',
              borderRadius: '5px',
              backgroundColor: '#f9f9f9',
              textAlign: 'left',  // Left-align the chat messages
            }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className="message-wrapper"  // Use the message-wrapper class
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #ddd',
                  color: '#333',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <strong>{message.timestamp}:</strong> {message.text}
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteMessage(index)}
                  className="delete-button"  // Use the delete-button class
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

          {/* Message Input */}
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
    </AppTheme>
  );
};

export default ChatPage;
