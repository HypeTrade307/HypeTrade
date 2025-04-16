import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config';
import './FriendRequestNotification.css';

interface FriendRequest {
  request_id: number;
  sender_id: number;
  sender_username: string;
  created_at: string;
}

export default function FriendRequestNotification() {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  // Fetch friend requests
  useEffect(() => {
    const fetchFriendRequests = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(`${API_BASE_URL}/users/friend-requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setFriendRequests(response.data);
      } catch (error) {
        console.error('Error fetching friend requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriendRequests();

    // Set up polling for new friend requests
    const intervalId = setInterval(fetchFriendRequests, 30000); // Check every 30 seconds
    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  const handleAcceptRequest = async (requestId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(
        `${API_BASE_URL}/users/accept-friend-request/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove the accepted request from the list
      setFriendRequests(friendRequests.filter(request => request.request_id !== requestId));
      toast.success('Friend request accepted!');
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Failed to accept friend request');
    }
  };

  const handleDeclineRequest = async (requestId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(
        `${API_BASE_URL}/users/decline-friend-request/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove the declined request from the list
      setFriendRequests(friendRequests.filter(request => request.request_id !== requestId));
      toast.info('Friend request declined');
    } catch (error) {
      console.error('Error declining friend request:', error);
      toast.error('Failed to decline friend request');
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
                onClick={() => handleAcceptRequest(request.request_id)}
              >
                Accept
              </button>
              <button 
                className="decline-button"
                onClick={() => handleDeclineRequest(request.request_id)}
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 