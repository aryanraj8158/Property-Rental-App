import React, { useEffect, useState } from 'react';
import axios from 'axios';

function FindAgent() {
  const [owners, setOwners] = useState([]);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await axios.get('http://localhost:5000/owners', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setOwners(response.data);
      } catch (error) {
        console.error('Error fetching owners:', error.response?.data || error.message);
      }
    };

    fetchOwners();
  }, []);

  return (
    <div className="min-h-screen p-6 mt-12">
      <h2 className="text-2xl font-bold mb-6">List of Property Owners</h2>
      {owners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {owners.map((owner) => (
            <div key={owner._id} className="bg-white p-4 rounded shadow-md">
              <h3 className="text-lg font-bold">{owner.name}</h3>
              <p><strong>Email:</strong> {owner.email}</p>
              <p><strong>Contact Number:</strong> {owner.contactNumber}</p>
              <p><strong>Location:</strong> {owner.city}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No property owners found.</p>
      )}
    </div>
  );
}

export default FindAgent;
