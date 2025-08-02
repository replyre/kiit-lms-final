import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext'; // To get the logged-in user

// API URL
const API_URL = 'https://meeting-backend-theta.vercel.app/api/meetings';

// 1. Create the Context
const MeetingContext = createContext();

// 2. Create the Provider Component
export const MeetingProvider = ({ children }) => {
  const { user } = useAuth(); // Access user data
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch meetings for the logged-in teacher
  const fetchMeetings = useCallback(async () => {
    if (!user?._id) return; // Don't fetch if no user
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch meetings');
      
      const data = await response.json();
      // Filter meetings that belong to the current teacher
      setMeetings(data.filter((meeting) => meeting.teacherId === user._id));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?._id]); // Re-run only if the user ID changes

  // Run fetchMeetings when the component mounts or user changes
  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // Create a new meeting
  const createMeeting = async (meetingData) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...meetingData, teacherId: user._id }),
      });
      if (!response.ok) throw new Error('Failed to create meeting');
      
      await fetchMeetings(); // Refresh the list
      return true; // Indicate success
    } catch (err) {
      setError(err.message);
      return false; // Indicate failure
    }
  };

  // Update an existing meeting
  const updateMeeting = async (id, updateData) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error('Failed to update meeting');
      
      await fetchMeetings(); // Refresh the list
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Delete a meeting
  const deleteMeeting = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete meeting');
      
      await fetchMeetings(); // Refresh the list
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // 3. Define the value to be passed to consumers
  const value = {
    meetings,
    loading,
    error,
    fetchMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
  };

  return (
    <MeetingContext.Provider value={value}>
      {children}
    </MeetingContext.Provider>
  );
};

// 4. Create a custom hook for easy consumption
export const useMeeting = () => {
  return useContext(MeetingContext);
};