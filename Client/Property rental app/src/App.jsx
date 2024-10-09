import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Property from './pages/PropertyContext'
import ProfileOwner from './pages/ProfileOwner';
import ProfileRenter from './pages/ProfileRenter';
import { PropertyProvider } from './pages/PropertyContext';
import FindAgent from './pages/FindAgent';
import City from './pages/City';

function App() {
  return (
    <PropertyProvider>
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/findagent" element={<FindAgent />} />
        <Route path="/city" element={<City />} />
        <Route path="/login" element={<Login />} /> 
        <Route path="/register" element={<Register />} />
        <Route path="/property" element={<Property />} />
        <Route path="/profile-owner" element={<ProfileOwner />} />
        <Route path="/profile-renter" element={<ProfileRenter />} />
      </Routes>
      </Router>
      </PropertyProvider>
  )
}

export default App