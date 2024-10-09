import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useProperties } from './PropertyContext';

function ProfileRenter() {
  const { properties, setProperties, token } = useProperties();
  const [userData, setUserData] = useState(null);
  const [interestedProperties, setInterestedProperties] = useState(() => {
    const storedInterestedProperties = localStorage.getItem('interestedProperties');
    return storedInterestedProperties ? new Set(JSON.parse(storedInterestedProperties)) : new Set();
  });

  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error.response?.data || error.message);
      }
    };

    const fetchProperties = async () => {
      try {
        const response = await axios.get('http://localhost:5000/properties', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setProperties(response.data);
      } catch (error) {
        console.error('Error fetching properties:', error.response?.data || error.message);
      }
    };

    const fetchInterestedProperties = async () => {
      try {
        const response = await axios.get('http://localhost:5000/interested', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const interestedIds = new Set(response.data.map(property => property._id));
        setInterestedProperties(interestedIds);
      } catch (error) {
        console.error('Error fetching interested properties:', error.response?.data || error.message);
      }
    };

    fetchUserData();
    fetchProperties();
    fetchInterestedProperties();
  }, [setProperties, token]);

  const handleRequest = async (roomId, ownerId) => {
    if (!userData || !userData._id) {
      console.error('Renter ID is undefined. Make sure the user is logged in.');
      return;
    }

    if (interestedProperties.has(roomId)) {
      alert('You have already shown interest in this property.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/request', {
        roomId,
        renterId: userData._id,
        ownerId,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const updatedInterestedProperties = new Set(interestedProperties);
      updatedInterestedProperties.add(roomId);
      setInterestedProperties(updatedInterestedProperties);
      localStorage.setItem('interestedProperties', JSON.stringify(Array.from(updatedInterestedProperties)));

      alert(response.data.message);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to send request. Please try again.";
      console.error("Error sending request:", error);
      alert(errorMessage);
    }
  };

  const handleProfilePictureUpload = async (event) => {
    const formData = new FormData();
    formData.append('profilePicture', event.target.files[0]);

    try {
      const response = await axios.post('http://localhost:5000/profile/picture', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(response.data.message);
      setUserData((prevUserData) => ({
        ...prevUserData,
        profilePicture: response.data.profilePicture,
      }));
    } catch (error) {
      console.error('Error uploading profile picture:', error.response?.data || error.message);
      alert('Failed to upload profile picture. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex mt-12">
      {userData && (
        <div className="w-1/4 bg-white p-6 rounded shadow-md mb-6 mr-4">
          <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
          <p><strong>Name:</strong> {userData.name}</p>
          <p><strong>Contact Number:</strong> {userData.contactNumber}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          {userData.profilePicture && (
            <img src={`http://localhost:5000/${userData.profilePicture}`} alt="Profile" className="w-32 h-32 rounded-full mt-2" />
          )}
          <input type="file" onChange={handleProfilePictureUpload} accept="image/*" className="mt-4" />
        </div>
      )}

      <div className="w-3/4 p-6">
        <h2 className="text-2xl font-bold mb-4">Available Rooms</h2>
        {properties.length > 0 ? (
          properties.map((property, index) => (
            <div key={index} className="mb-4 p-4 border rounded flex">
              <div className="flex-grow">
                <h3 className="text-lg font-bold">{property.title}</h3>
                {property.images && property.images.map((image, index) => (
                  <img key={index} src={`http://localhost:5000/${image}`} alt="Loading Image..." className="w-64 h-64 object-cover rounded"/>
                ))}
                <p>{property.description}</p>
                <p className="font-semibold">Price: {property.price}</p>
                <p className="font-semibold">Location: {property.location}</p>
                <button
                  onClick={() => handleRequest(property._id, property.ownerId._id)}
                  className={`p-2 rounded mt-2 ${
                    interestedProperties.has(property._id) 
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-500 text-white'
                  }`}
                  disabled={interestedProperties.has(property._id)}
                >
                  {interestedProperties.has(property._id) ? 'Interested' : 'Show Interest'}
                </button>
              </div>

              {interestedProperties.has(property._id) && (
                <div className="bg-white p-4 rounded shadow-md ml-4">
                  <h4 className="text-lg font-bold">Owner Information</h4>
                  <p><strong>Name:</strong> {property.ownerId.name}</p>
                  <p><strong>Contact Number:</strong> {property.ownerId.contactNumber}</p>
                  <p><strong>Email:</strong> {property.ownerId.email}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No available rooms. Please refresh.</p>
        )}
      </div>
    </div>
  );
}

export default ProfileRenter;
