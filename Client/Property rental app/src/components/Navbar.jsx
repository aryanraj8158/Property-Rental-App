import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProperties } from '../pages/PropertyContext'; 

const Navbar = () => {
  const { isLoggedIn, setIsLoggedIn, setUserData } = useProperties(); 
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    setIsLoggedIn(false); 
    navigate('/login'); 
    setUserData(null);
  };

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-10 py-4 px-8 flex justify-between items-center">
      <div className="flex items-center">
        <span className="text-red-500 font-bold text-xl">Property Rental</span>
      </div>
      <ul className="flex space-x-6 text-gray-700">
        <li><Link to="/" className="hover:text-red-500">Home</Link></li>
        <li><Link to="/city" className="hover:text-red-500">City</Link></li>
        <li><Link to="/findagent" className="hover:text-red-500">Find Agent</Link></li>
      </ul>
      <div>
        {isLoggedIn ? (
          <button 
            onClick={handleLogout}
            className="border border-gray-300 text-gray-700 px-4 py-1 rounded hover:border-gray-500">
            Log out
          </button>
        ) : (
          <Link to="/login">
            <button className="border border-gray-300 text-gray-700 px-4 py-1 rounded hover:border-gray-500">
              Log in
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
