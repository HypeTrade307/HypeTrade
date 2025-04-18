import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface Friend {
  user_id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

const FriendsList: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication error. Please log in again.');
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/friends`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFriends(response.data);
    } catch (error: any) {
      console.error('Error fetching friends:', error);
      toast.error(error.response?.data?.detail || 'Failed to fetch friends');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication error. Please log in again.');
        return;
      }

      await axios.delete(
        `${API_BASE_URL}/remove_friend/${friendId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Friend removed successfully');
      fetchFriends(); // Refresh the friends list
    } catch (error: any) {
      console.error('Error removing friend:', error);
      toast.error(error.response?.data?.detail || 'Failed to remove friend');
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  return (
    <div>
      {/* Render your friends list here */}
    </div>
  );
};

export default FriendsList; 