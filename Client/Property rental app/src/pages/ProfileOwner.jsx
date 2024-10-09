import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfileOwner = () => {
  const [profile, setProfile] = useState({});
  const [image, setImage] = useState(null); 
  const [propertyImages, setPropertyImages] = useState([]); 
  const [properties, setProperties] = useState([]);
  const [propertyData, setPropertyData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
  });
  const [interestedRenters, setInterestedRenters] = useState({});

  useEffect(() => {
    axios.get('http://localhost:5000/profile', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(response => setProfile(response.data))
      .catch(error => console.error('Profile fetch error:', error));

    axios.get('http://localhost:5000/properties', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(response => setProperties(response.data))
      .catch(error => console.error('Property fetch error:', error));
  }, []);

  const handleImageUpload = (e) => {
    setImage(e.target.files[0]);
  };

  const handlePropertyImagesUpload = (e) => {
    setPropertyImages([...e.target.files]); 
  };

  const handleImageSubmit = () => {
    const formData = new FormData();
    formData.append('profilePicture', image);
    axios.post('http://localhost:5000/profile/picture', formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => alert('Profile picture updated successfully'))
      .catch(error => console.error('Error uploading image:', error));
  };

  const handlePropertyChange = (e) => {
    setPropertyData({ ...propertyData, [e.target.name]: e.target.value });
  };

  const fetchInterestedRenters = async (propertyId) => {
    try {
      const response = await axios.get(`http://localhost:5000/properties/${propertyId}/interested`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setInterestedRenters(prevState => ({
        ...prevState,
        [propertyId]: response.data
      }));
    } catch (error) {
      console.error('Error fetching interested renters:', error);
    }
  };

  const handlePropertySubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (let key in propertyData) {
      formData.append(key, propertyData[key]);
    }

    for (let i = 0; i < propertyImages.length; i++) {
      formData.append('images', propertyImages[i]);
    }

    axios.post('http://localhost:5000/properties', formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => {
        alert('Property added successfully');
        setProperties([...properties, response.data]); 
      })
      .catch(error => console.error('Error adding property:', error));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-100 rounded-lg shadow-lg mt-12">
      <h2 className="text-2xl font-bold mb-4">Owner Profile</h2>
      <img 
        src={`http://localhost:5000/${profile.profilePicture}`} 
        alt="Profile" 
        className="w-32 h-32 object-cover rounded-full mb-4" 
      />
      <p><strong>Name: </strong> {profile.name}</p>
      <p><strong>Contact: </strong>{profile.contactNumber}</p>
      <p><strong>City: </strong>{profile.city}</p>

      <div className="mb-4">
        <input 
          type="file" 
          onChange={handleImageUpload} 
          className="border border-gray-300 rounded p-2 mb-2 w-full"
        />
        <button 
          onClick={handleImageSubmit} 
          className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600 transition"
        >
          Upload Profile Picture
        </button>
      </div>

      <form onSubmit={handlePropertySubmit} className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Add New Property</h3>
        <input 
          type="text" 
          name="title" 
          placeholder="Title" 
          onChange={handlePropertyChange} 
          className="border border-gray-300 rounded p-2 mb-2 w-full" 
        />
        <input 
          type="text" 
          name="description" 
          placeholder="Description" 
          onChange={handlePropertyChange} 
          className="border border-gray-300 rounded p-2 mb-2 w-full" 
        />
        
        <div className="flex items-center mb-2">
          <span className="mr-2">Rs</span>
          <input 
            type="number" 
            name="price" 
            placeholder="Price per month" 
            onChange={handlePropertyChange} 
            className="border border-gray-300 rounded p-2 w-full" 
          />
        </div>

        <input 
          type="text" 
          name="location" 
          placeholder="Location" 
          onChange={handlePropertyChange} 
          className="border border-gray-300 rounded p-2 mb-2 w-full" 
        />
        <input 
          type="file" 
          name="images" 
          multiple 
          onChange={handlePropertyImagesUpload} 
          className="border border-gray-300 rounded p-2 mb-2 w-full" 
        />
        <button 
          type="submit" 
          className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600 transition"
        >
          Add Property
        </button>
      </form>

      <div className="property-list">
        <h3 className="text-xl font-semibold mb-2">Your Properties</h3>
        {properties.length === 0 ? ( 
          <p className="text-gray-500">Start Listing your Properties Now</p>
        ) : (
          properties.map(property => (
            <div key={property._id} className="border border-gray-300 rounded p-4 mb-4">
              <h4 className="text-lg font-bold">{property.title}</h4>
              <p>{property.description}</p>
              <p className="font-semibold">Price: {property.price}</p>
              <p className="font-semibold">Location: {property.location}</p>
              <div className="mt-2">
                {property.images && property.images.map((image, index) => (
                  <img 
                    key={index} 
                    src={`http://localhost:5000/${image}`} 
                    alt={`Property Image ${index}`} 
                    className="w-full h-32 object-cover rounded mb-2" 
                  />
                ))}
              </div>

              <button
                onClick={() => fetchInterestedRenters(property._id)}
                className="bg-green-500 text-white p-2 rounded mt-2"
              >
                Show Interested Renters
              </button>

              {interestedRenters[property._id] && (
                <div className="mt-4">
                  <h5 className="text-md font-bold">Interested Renters:</h5>
                  {interestedRenters[property._id].length > 0 ? (
                    interestedRenters[property._id].map(renter => (
                      <div key={renter._id} className="p-2 border rounded mt-2">
                        <p><strong>Name:</strong> {renter.name}</p>
                        <p><strong>Contact:</strong> {renter.contactNumber}</p>
                        <p><strong>Email:</strong> {renter.email}</p>
                      </div>
                    ))
                  ) : (
                    <p>No renters have shown interest yet.</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProfileOwner;