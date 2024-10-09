import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const PropertyContext = createContext();

export const PropertyProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [fetchError, setFetchError] = useState(null); 
  const [userData, setUserData] = useState(null); 

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsLoggedIn(true);
      fetchProperties(storedToken); 
    }
  }, []);

  const fetchProperties = async (authToken) => {
    if (!authToken) return; 
    try {
      const response = await axios.get('http://localhost:5000/properties', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      console.log('Properties fetched:', response.data); 
      setProperties(response.data);
      setFetchError(null); 
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]); 
      setFetchError('Failed to fetch properties. Please try again later.'); 
    }
  };

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setToken(token);
    setIsLoggedIn(true);
    setUserData(userData); 
    fetchProperties(token); 
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setToken(null);
    setProperties([]); 
    setUserData(null); 
    setFetchError(null); 
  };

  return (
    <PropertyContext.Provider value={{ 
      properties, setProperties, isLoggedIn, setIsLoggedIn, token, setToken, userData, setUserData, login, logout, fetchError 
    }}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperties = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperties must be used within a PropertyProvider');
  }
  return context;
};

export default PropertyContext;
