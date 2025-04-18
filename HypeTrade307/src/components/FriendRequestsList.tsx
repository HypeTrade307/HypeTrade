import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import { API_BASE_URL } from '../config';

interface FriendRequest {
  id: string;
  sender_id: string;
  sender_username: string;
  receiver_id: string;
  status: string;
  created_at: string;
}

const FriendRequestsList: React.FC = () => {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriendRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication error. Please log in again.');
        return;
      }

      const response = await axios.get<FriendRequest[]>(
        `${API_BASE_URL}/friend_requests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFriendRequests(response.data);
    } catch (error: any) {
      console.error('Error fetching friend requests:', error);
      toast.error(error.response?.data?.detail || 'Failed to fetch friend requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (senderId: string) => {
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
      fetchFriendRequests(); // Refresh the friend requests list
    } catch (error: any) {
      console.error('Error accepting friend request:', error);
      toast.error(error.response?.data?.detail || 'Failed to accept friend request');
    }
  };

  const handleDeclineRequest = async (senderId: string) => {
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
      fetchFriendRequests(); // Refresh the friend requests list
    } catch (error: any) {
      console.error('Error declining friend request:', error);
      toast.error(error.response?.data?.detail || 'Failed to decline friend request');
    }
  };

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  if (loading) {
    return <div className="text-center p-4">Loading friend requests...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Friend Requests</h2>
      {friendRequests.length === 0 ? (
        <p className="text-gray-500">No pending friend requests</p>
      ) : (
        <div className="space-y-4">
          {friendRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between"
            >
              <div>
                <p className="font-semibold">{request.sender_username}</p>
                <p className="text-sm text-gray-500">
                  Sent {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleAcceptRequest(request.sender_id)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDeclineRequest(request.sender_id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendRequestsList; 