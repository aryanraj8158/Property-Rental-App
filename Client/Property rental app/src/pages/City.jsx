import React, { useEffect, useState } from 'react';
import axios from 'axios';

function City() {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get('http://localhost:5000/cities', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setCities(response.data);
      } catch (error) {
        console.error('Error fetching cities:', error.response?.data || error.message);
      }
    };

    fetchCities();
  }, []);

  return (
    <div className="min-h-screen p-6 mt-12">
      <h2 className="text-2xl font-bold mb-6">Rental Service available in below Cities</h2>
      {cities.length > 0 ? (
        <ul className="list-disc ml-6">
          {cities.map((city, index) => (
            <li key={index} className="text-lg font-medium">
              {city}
            </li>
          ))}
        </ul>
      ) : (
        <p>No cities found.</p>
      )}
    </div>
  );
}

export default City;
