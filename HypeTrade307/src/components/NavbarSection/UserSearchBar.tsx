//@ts-ignore
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import './UserSearchBar.css';

interface User {
  user_id: number;
  username: string;
  email: string;
}

export default function UserSearchBar() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search for users when query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await axios.get(`${API_BASE_URL}/users/search/${searchQuery}`, { headers });
        
        if (response.status === 200) {
          setSearchResults(response.data);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Error searching for users:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleUserClick = (userId: number) => {
    setShowResults(false);
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="user-search-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <input
          type="text"
          className="user-search-input"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {loading && <span className="search-loading">Searching...</span>}
      </div>
      
      {showResults && searchResults.length > 0 && (
        <div className="search-results-dropdown">
          {searchResults.map((user) => (
            <div 
              key={user.user_id} 
              className="search-result-item"
              onClick={() => handleUserClick(user.user_id)}
            >
              <span className="user-name">{user.username}</span>
              <span className="user-email">{user.email}</span>
            </div>
          ))}
        </div>
      )}
      
      {showResults && searchResults.length === 0 && searchQuery.trim() !== "" && (
        <div className="no-results-dropdown">
          No users found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
} 