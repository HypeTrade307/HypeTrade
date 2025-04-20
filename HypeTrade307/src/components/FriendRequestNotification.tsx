import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './FriendRequestNotification.css';
import { API_BASE_URL } from '../config';

interface FriendRequest {
  request_id: number;
  sender_id: number;
  sender_username: string;
  created_at: string;
}

const FriendRequestNotification: React.FC = () => {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          setIsAuthenticated(true);
          await fetchFriendRequests();
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };

    checkAuth();
    const interval = setInterval(fetchFriendRequests, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchFriendRequests = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/users/friend_requests`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setFriendRequests(response.data);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (senderId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication error. Please log in again.');
        return;
      }

      await axios.post(
        `${API_BASE_URL}/accept_friend_request/${senderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Friend request accepted');
      setFriendRequests(requests => requests.filter(req => req.sender_id !== senderId));
    } catch (error: any) {
      console.error('Error accepting friend request:', error);
      toast.error(error.response?.data?.detail || 'Failed to accept friend request');
    }
  };

  const handleDeclineRequest = async (senderId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication error. Please log in again.');
        return;
      }

      await axios.post(
        `${API_BASE_URL}/decline_friend_request/${senderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Friend request declined');
      setFriendRequests(requests => requests.filter(req => req.sender_id !== senderId));
    } catch (error: any) {
      console.error('Error declining friend request:', error);
      toast.error(error.response?.data?.detail || 'Failed to decline friend request');
    }
  };

  if (!isAuthenticated || loading) {
    return null;
  }

  if (friendRequests.length === 0) {
    return null;
  }

  return (
    <div className="friend-requests-container">
      <h3 className="friend-requests-title">Friend Requests</h3>
      <div className="friend-requests-list">
        {friendRequests.map((request) => (
          <div key={request.request_id} className="friend-request-item">
            <div className="friend-request-info">
              <span className="friend-request-username">{request.sender_username}</span>
              <span className="friend-request-time">
                {new Date(request.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="friend-request-actions">
              <button
                className="accept-button"
                onClick={() => handleAcceptRequest(request.sender_id)}
              >
                Accept
              </button>
              <button
                className="decline-button"
                onClick={() => handleDeclineRequest(request.sender_id)}
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendRequestNotification; 