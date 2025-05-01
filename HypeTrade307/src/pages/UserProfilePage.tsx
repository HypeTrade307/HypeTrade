//@ts-nocheck
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/NavbarSection/Navbar';
import CssBaseline from '@mui/material/CssBaseline';
import AppTheme from '../components/shared-theme/AppTheme';
import './UserProfilePage.css';
import FlagButton from './FlagButton';
import { API_BASE_URL } from '../config';

interface User {
  user_id: number;
  username: string;
  email: string;
}

interface Stock {
  stock_id: number;
  stock_name: string;
  ticker: string;
  value?: number;
  sentiment?: number;
}

interface Portfolio {
  portfolio_id: number;
  portfolio_name: string;
  stocks: Stock[];
}

export default function UserProfilePage(props: { disableCustomTheme?: boolean }) {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFriend, setIsFriend] = useState<boolean>(false);
  const [isCurrentUser, setIsCurrentUser] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<boolean>(false);

  // Check if user is authenticated and get current user ID
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, user is not authenticated');
        setIsAuthenticated(false);
        setCurrentUserId(null);
        return;
      }

      try {
        console.log('Checking authentication with token');
        const response = await axios.get(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Authentication check response:', response);
        
        if (response.data) {
          console.log('User is authenticated');
          setIsAuthenticated(true);
          
          // Get current user ID from the response
          if (response.data.user_id) {
            console.log('Current user ID from /users/me:', response.data.user_id);
            setCurrentUserId(response.data.user_id);
            
            // Check if viewing own profile
            if (userId && parseInt(userId) === response.data.user_id) {
              console.log('User is viewing their own profile');
              setIsCurrentUser(true);
            }
          } else {
            console.log('No user_id in response, trying portfolios');
            try {
              const portfoliosResponse = await axios.get(`${API_BASE_URL}/portfolios/`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              if (portfoliosResponse.data && portfoliosResponse.data.length > 0) {
                const userPortfolio = portfoliosResponse.data[0];
                console.log('Current user ID from portfolios:', userPortfolio.user_id);
                setCurrentUserId(userPortfolio.user_id);
                
                if (userId && parseInt(userId) === userPortfolio.user_id) {
                  console.log('User is viewing their own profile');
                  setIsCurrentUser(true);
                }
              }
            } catch (portfolioError) {
              console.error('Error fetching portfolios for user ID:', portfolioError);
            }
          }
        } else {
          console.log('No data in response, user is not authenticated');
          setIsAuthenticated(false);
          setCurrentUserId(null);
        }
      } catch (error: any) {
        console.error('Error checking authentication:', error);
        if (error.response && error.response.status === 401) {
          console.log('Authentication error detected, clearing token');
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setCurrentUserId(null);
        } else {
          console.log('Non-401 error, keeping token but marking as not authenticated');
          setIsAuthenticated(false);
          setCurrentUserId(null);
        }
      }
    };

    checkAuth();
  }, [userId]);

  // Moved  check for friendship status because it was buggy
  useEffect(() => {
    const checkFriendship = async () => {
      if (!isAuthenticated || !currentUserId || !userId) {
        console.log('Skipping friendship check:', {
          isAuthenticated,
          currentUserId,
          userId
        });
        setIsFriend(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found for friendship check');
          setIsFriend(false);
          return;
        }

        console.log('Checking friendship status with:', {
          currentUserId,
          userId,
          userIdType: typeof userId,
          currentUserIdType: typeof currentUserId
        });
        
        const friendsResponse = await axios.get(
          `${API_BASE_URL}/friendship_status/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('Raw friendship status response:', friendsResponse.data);
        console.log('Friendship status:', friendsResponse.data.status);
        
        const isFriends = String(friendsResponse.data.status).toLowerCase() === "friends";
        console.log('Setting isFriend to:', isFriends);
        setIsFriend(isFriends);
      } catch (error: any) {
        console.error('Error checking friendship:', error);
        console.error('Error response:', error.response?.data);
        setIsFriend(false);
      }
    };

    checkFriendship();
  }, [isAuthenticated, currentUserId, userId]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch user data
        const userResponse = await axios.get(`${API_BASE_URL}/users/${userId}`, { headers });
        setUser(userResponse.data);

        // Fetch user's portfolios
        if (isAuthenticated) {
          await fetchUserPortfolios(userId, headers);
        } else {
          // If not authenticated, set empty portfolios
          setPortfolios([]);
        }
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        
        if (error.response && error.response.status === 404) {
          setError('User not found. The requested profile does not exist.');
        } else {
          setError('Failed to load user data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, isAuthenticated]);

  // Separate function to fetch user portfolios
  const fetchUserPortfolios = async (userId: string, headers: any) => {
    try {
      console.log(`Fetching portfolios for user ID: ${userId}`);
      console.log('Using headers:', headers);
      
      // Use the dedicated endpoint to get portfolios for this specific user
      const portfoliosResponse = await axios.get(
        `${API_BASE_URL}/portfolios/user/${userId}`, 
        { headers }
      );
      console.log('User portfolios response:', portfoliosResponse);
      console.log('User portfolios data:', portfoliosResponse.data);
      
      if (!portfoliosResponse.data || portfoliosResponse.data.length === 0) {
        console.log('No portfolios found for user');
        setPortfolios([]);
        return;
      }
      
      // For each portfolio, fetch its stocks
      const portfoliosWithStocks = await Promise.all(
        portfoliosResponse.data.map(async (portfolio: any) => {
          try {
            console.log(`Fetching stocks for portfolio ${portfolio.portfolio_id}`);
            const stocksResponse = await axios.get(
              `${API_BASE_URL}/portfolios/${portfolio.portfolio_id}/stocks`, 
              { headers }
            );
            console.log(`Stocks for portfolio ${portfolio.portfolio_id}:`, stocksResponse.data);
            return {
              ...portfolio,
              stocks: stocksResponse.data || []
            };
          } catch (error: any) {
            console.error(`Error fetching stocks for portfolio ${portfolio.portfolio_id}:`, error);
            // Don't clear token here, just log the error and continue
            return {
              ...portfolio,
              stocks: []
            };
          }
        })
      );
      
      console.log('Final portfolios with stocks:', portfoliosWithStocks);
      setPortfolios(portfoliosWithStocks);
    } catch (error: any) {
      console.error('Error fetching portfolios:', error);
      console.error('Error details:', error.response?.data);
      // Don't set error here, just log it and continue
      // Don't clear token here either
    }
  };

  const handleAddFriend = async () => {
    if (!isAuthenticated || !userId) {
      toast.error('Please log in to add friends');
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

      console.log('Sending friend request with data:', {
        current_user: currentUserId,
        add_user: parseInt(userId),
        current_user_type: typeof currentUserId,
        add_user_type: typeof userId
      });

      await axios.post(
        `${API_BASE_URL}/send_friend_request/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Friend request sent successfully!');
      
      // Refresh the page to update the UI
      // window.location.reload();
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response && error.response.status === 401) {
        toast.error('Authentication error. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        const errorMessage = error.response?.data?.detail || 'Failed to send friend request';
        toast.error(errorMessage);
      }
    }
  };

  const handleRemoveFriend = async () => {
    if (!isAuthenticated || !userId) {
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

      console.log('Removing friend with data:', {
        current_user: currentUserId,
        remove_user: userId
      });

      // Use the correct endpoint for removing friends
      await axios.delete(
        `${API_BASE_URL}/remove_friend/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Friend removed successfully!');
      setIsFriend(false);
      
      // Refresh the page to update the UI
      window.location.reload();
    } catch (error: any) {
      console.error('Error removing friend:', error);
      console.error('Error response:', error.response?.data);
      
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

  const handleViewPortfolio = (portfolio: Portfolio) => {
    if (isCurrentUser || isFriend) {
      setSelectedPortfolio(portfolio);
    } else {
      toast.info('You need to be friends with this user to view their portfolio contents.');
    }
  };

  const handleClosePortfolio = () => {
    setSelectedPortfolio(null);
  };

  if (loading) {
    return (
      <AppTheme {...props}>
        <CssBaseline enableColorScheme />
        <Navbar />
        <div className="user-profile-container">
          <div className="loading-message">Loading user profile...</div>
        </div>
      </AppTheme>
    );
  }

  if (error || !user) {
    return (
      <AppTheme {...props}>
        <CssBaseline enableColorScheme />
        <Navbar />
        <div className="user-profile-container">
          <div className="error-message">{error || 'User not found'}</div>
        </div>
      </AppTheme>
    );
  }

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Navbar />
      
      <div className="user-profile-container">
        <div className="user-profile-header">
          <h1>{user.username}'s Profile</h1>
          
          {isAuthenticated && !isCurrentUser && !isFriend && (
            <div className="actions">
              <button 
                className="add-friend-button"
                onClick={handleAddFriend}
              >
                Add Friend
              </button>
              <FlagButton
                target_id={user.user_id}
                flag_type="user"
              /> 
            </div>
          )}
          
          {isAuthenticated && !isCurrentUser && isFriend && (
            <div className="friend-actions-container">
            <div className="friend-status">Friends</div>
            <button className="remove-friend-button" onClick={() => setShowRemoveConfirm(true)}>
              Remove Friend
            </button>
            <div className="actions">
              <FlagButton target_id={user.user_id} flag_type="user" />
            </div>
          </div>
          )}
          
          {!isAuthenticated && (
            <button 
              className="add-friend-button"
              onClick={() => navigate('/login')}
            >
              Login to Add Friend
            </button>
          )}
        </div>
        
        {/* Confirmation Dialog for Removing Friend */}
        {showRemoveConfirm && (
          <div className="confirmation-dialog">
            <div className="confirmation-content">
              <h3>Remove Friend</h3>
              <p>Are you sure you want to remove {user.username} from your friends list?</p>
              <div className="confirmation-buttons">
                <button 
                  className="confirm-button"
                  onClick={() => {
                    handleRemoveFriend();
                    setShowRemoveConfirm(false);
                  }}
                >
                  Yes, Remove
                </button>
                <button 
                  className="cancel-button"
                  onClick={() => setShowRemoveConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="user-profile-content">
          <div className="user-info-section">
            <h2>User Information</h2>
            <div className="user-info-item">
              <span className="info-label">Username:</span>
              <span className="info-value">{user.username}</span>
            </div>
          </div>
          
          <div className="user-portfolios-section">
            <h2>Portfolios</h2>
            {loading ? (
              <div className="loading-message">Loading portfolios...</div>
            ) : portfolios.length > 0 ? (
              <div className="portfolios-grid">
                {portfolios.map((portfolio) => (
                  <div 
                    key={portfolio.portfolio_id} 
                    className="portfolio-card"
                    onClick={() => handleViewPortfolio(portfolio)}
                  >
                    <h3>{portfolio.portfolio_name}</h3>
                    <div className="portfolio-stocks-count">
                      {portfolio.stocks ? portfolio.stocks.length : 0} stocks
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-portfolios">
                {isAuthenticated ? 
                  (isCurrentUser ? 
                    "You don't have any portfolios yet." : 
                    "This user doesn't have any portfolios.") : 
                  "Login to view portfolios"}
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Details Modal */}
        {selectedPortfolio && (
          <div className="portfolio-modal">
            <div className="portfolio-modal-content">
              <div className="portfolio-modal-header">
                <h2>{selectedPortfolio.portfolio_name}</h2>
                <button className="close-button" onClick={handleClosePortfolio}>×</button>
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