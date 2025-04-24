//@ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../components/NavbarSection/Navbar";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../components/shared-theme/AppTheme";
import "./FriendList.css";
import { API_BASE_URL } from "../config";

interface Friend {
  user_id: number;
  username: string;
  email: string;
}

interface Portfolio {
  portfolio_id: number;
  portfolio_name: string;
  stocks: any[];
}

interface Message {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  is_flagged: boolean;
  sender_username: string;
  receiver_username: string;
}

function FriendList(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<boolean>(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [currentPortfolioIndex, setCurrentPortfolioIndex] = useState<number>(0);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [showFlagDialog, setShowFlagDialog] = useState<boolean>(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [flagReason, setFlagReason] = useState<string>("");

  // Check authentication and get current user ID
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/notifications/user/`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data && response.data.length > 0 && response.data[0].receiver_id) {
          setIsAuthenticated(true);
          setCurrentUserId(response.data[0].receiver_id);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch friends list
  useEffect(() => {
    const fetchFriends = async () => {
      if (!isAuthenticated) return;

      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(`${API_BASE_URL}/friends`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setFriends(response.data);
      } catch (error) {
        console.error('Error fetching friends:', error);
        toast.error('Failed to load friends list');
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [isAuthenticated]);

  // Fetch messages when a friend is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedFriend || !isAuthenticated) return;

      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(
          `${API_BASE_URL}/messages/chat/${selectedFriend.user_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      }
    };

    // Initial fetch
    fetchMessages();

    // Set up polling if chat is open
    if (showChat) {
      const intervalId = setInterval(fetchMessages, 3000); // Poll every 3 seconds
      return () => clearInterval(intervalId); // Clean up on unmount or when chat closes
    }
  }, [selectedFriend, isAuthenticated, showChat]);

  const handleRemoveFriend = async (friendId: number) => {
    if (!isAuthenticated) {
      toast.error('Please log in to remove friends');
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication error. Please log in again.');
        navigate('/login');
        return;
      }

      await axios.delete(
        `${API_BASE_URL}/remove_friend/${friendId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Friend removed successfully!');
      setFriends(friends.filter(friend => friend.user_id !== friendId));
      setShowRemoveConfirm(false);
    } catch (error: any) {
      console.error('Error removing friend:', error);
      if (error.response && error.response.status === 401) {
        toast.error('Authentication error. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        const errorMessage = error.response?.data?.detail || 'Failed to remove friend';
        toast.error(errorMessage);
      }
    }
  };

  const handleViewPortfolio = async (friend: Friend) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication error. Please log in again.');
        navigate('/login');
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/portfolios/user/${friend.user_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.length > 0) {
        setSelectedFriend(friend);
        setPortfolios(response.data);
        setSelectedPortfolio(response.data[0]);
        setCurrentPortfolioIndex(0);
      } else {
        toast.info(`${friend.username} doesn't have any portfolios yet.`);
      }
    } catch (error: any) {
      console.error('Error fetching friend portfolios:', error);
      toast.error('Failed to load friend portfolios');
    }
  };

  const handleNextPortfolio = () => {
    if (currentPortfolioIndex < portfolios.length - 1) {
      setCurrentPortfolioIndex(currentPortfolioIndex + 1);
      setSelectedPortfolio(portfolios[currentPortfolioIndex + 1]);
    }
  };

  const handlePreviousPortfolio = () => {
    if (currentPortfolioIndex > 0) {
      setCurrentPortfolioIndex(currentPortfolioIndex - 1);
      setSelectedPortfolio(portfolios[currentPortfolioIndex - 1]);
    }
  };

  const handleClosePortfolio = () => {
    setSelectedPortfolio(null);
    setSelectedFriend(null);
  };

  const handleSendMessage = async () => {
    if (!selectedFriend || !newMessage.trim() || !isAuthenticated) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication error. Please log in again.');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/messages/`,
        {
          receiver_id: selectedFriend.user_id,
          content: newMessage
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages([response.data, ...messages]);
      setNewMessage("");
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.detail || 'Failed to send message');
    }
  };

  const handleFlagMessage = async () => {
    if (!selectedMessage || !flagReason.trim() || !isAuthenticated) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication error. Please log in again.');
        navigate('/login');
        return;
      }

      await axios.post(
        `${API_BASE_URL}/messages/${selectedMessage.message_id}/flag`,
        { reason: flagReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Message flagged successfully');
      setShowFlagDialog(false);
      setSelectedMessage(null);
      setFlagReason("");
    } catch (error: any) {
      console.error('Error flagging message:', error);
      toast.error(error.response?.data?.detail || 'Failed to flag message');
    }
  };

  const formatMessageTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <AppTheme {...props}>
        <CssBaseline enableColorScheme />
        <Navbar />
        <div className="friend-list-container">
          <div className="loading-message">Loading friends list...</div>
        </div>
      </AppTheme>
    );
  }

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Navbar />
      
      <div className="friend-list-container">
        <h1>Friends List</h1>
        
        {!isAuthenticated ? (
          <div className="login-prompt">
            <p>Please log in to view your friends list.</p>
            <button onClick={() => navigate('/login')}>Login</button>
          </div>
        ) : friends.length === 0 ? (
          <div className="no-friends">
            <p>You don't have any friends yet.</p>
            <p>Add friends by visiting their profiles!</p>
          </div>
        ) : (
          <div className="friends-list">
            {friends.map((friend) => (
              <div key={friend.user_id} className="friend-item">
                <div className="friend-info">
                  <span className="friend-username">{friend.username}</span>
                </div>
                
                <div className="friend-actions">
                  <button
                    className="view-portfolio-button"
                    onClick={() => handleViewPortfolio(friend)}
                  >
                    View Portfolios
                  </button>
                  
                  <button
                    className="chat-button"
                    onClick={() => {
                      setSelectedFriend(friend);
                      setShowChat(true);
                    }}
                  >
                    Chat
                  </button>
                  
                  <button
                    className="remove-friend-button"
                    onClick={() => {
                      setSelectedFriend(friend);
                      setShowRemoveConfirm(true);
                    }}
                  >
                    Remove Friend
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Remove Friend Confirmation Dialog */}
        {showRemoveConfirm && selectedFriend && (
          <div className="confirmation-dialog">
            <div className="confirmation-content">
              <h3>Remove Friend</h3>
              <p>Are you sure you want to remove {selectedFriend.username} from your friends list?</p>
              <div className="confirmation-buttons">
                <button
                  className="confirm-button"
                  onClick={() => handleRemoveFriend(selectedFriend.user_id)}
                >
                  Yes, Remove
                </button>
                <button
                  className="cancel-button"
                  onClick={() => {
                    setShowRemoveConfirm(false);
                    setSelectedFriend(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Modal */}
        {selectedPortfolio && selectedFriend && (
          <div className="portfolio-modal">
            <div className="portfolio-modal-content">
              <div className="portfolio-modal-header">
                <h2>{selectedFriend.username}'s Portfolio: {selectedPortfolio.portfolio_name}</h2>
                <button className="portfolio-close-button" onClick={handleClosePortfolio}>×</button>
              </div>
              
              <div className="portfolio-navigation">
                <button 
                  className="nav-button prev-button"
                  onClick={handlePreviousPortfolio}
                  disabled={currentPortfolioIndex === 0}
                >
                  ← Previous
                </button>
                <span className="portfolio-counter">
                  Portfolio {currentPortfolioIndex + 1} of {portfolios.length}
                </span>
                <button 
                  className="nav-button next-button"
                  onClick={handleNextPortfolio}
                  disabled={currentPortfolioIndex === portfolios.length - 1}
                >
                  Next →
                </button>
              </div>

              <div className="portfolio-description">
                <p>{selectedPortfolio.portfolio_name}</p>
              </div>

              <div className="portfolio-stocks-list">
                {selectedPortfolio.stocks && selectedPortfolio.stocks.length > 0 ? (
                  <table className="stocks-table">
                    <thead>
                      <tr>
                        <th>Stock Name</th>
                        <th>Ticker</th>
                        <th>Value</th>
                        <th>Sentiment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPortfolio.stocks.map((stock) => (
                        <tr key={stock.stock_id}>
                          <td>{stock.stock_name}</td>
                          <td>{stock.ticker}</td>
                          <td>{stock.value ? `$${stock.value.toFixed(2)}` : 'N/A'}</td>
                          <td>
                            <span className={`sentiment-indicator ${getSentimentClass(stock.sentiment)}`}>
                              {stock.sentiment !== undefined ? stock.sentiment.toFixed(2) : 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="no-stocks">No stocks in this portfolio</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chat Modal */}
        {showChat && selectedFriend && (
          <div className="chat-modal">
            <div className="chat-modal-content">
              <div className="chat-modal-header">
                <h2>Chat with {selectedFriend.username}</h2>
                <button className="close-button" onClick={() => setShowChat(false)}>×</button>
              </div>
              
              <div className="chat-messages">
                {messages.map((message) => (
                  <div 
                    key={message.message_id} 
                    className={`message ${message.sender_id === currentUserId ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <p>{message.content}</p>
                      <span className="message-time">{formatMessageTime(message.created_at)}</span>
                    </div>
                    {message.sender_id !== currentUserId && (
                      <button 
                        className="flag-button"
                        onClick={() => {
                          setSelectedMessage(message);
                          setShowFlagDialog(true);
                        }}
                      >
                        ...
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="chat-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage}>Send</button>
              </div>
            </div>
          </div>
        )}

        {/* Flag Dialog */}
        {showFlagDialog && selectedMessage && (
          <div className="flag-dialog">
            <div className="flag-dialog-content">
              <h3>Flag Message</h3>
              <p>Please provide a reason for flagging this message:</p>
              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="Enter reason..."
              />
              <div className="flag-dialog-buttons">
                <button onClick={handleFlagMessage}>Submit</button>
                <button onClick={() => {
                  setShowFlagDialog(false);
                  setSelectedMessage(null);
                  setFlagReason("");
                }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppTheme>
  );
}

// Helper function to determine sentiment class
function getSentimentClass(sentiment: number | undefined): string {
  if (sentiment === undefined) return 'neutral';
  if (sentiment > 0.5) return 'positive';
  if (sentiment < -0.5) return 'negative';
  return 'neutral';
}

export default FriendList; 