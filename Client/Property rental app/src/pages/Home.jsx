import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';

const Home = () => {
  return (
    <div className="relative h-screen mt-12">
      <video
    className="absolute inset-0 w-full h-full object-cover"
    autoPlay
    loop
    muted
    playsInline
  >
    <source src="/wallpaper.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
        <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative flex flex-col justify-center items-center h-full">
        <h1 className="text-white text-6xl md:text-8xl font-bold z-10">FIND YOUR STAY</h1>
      </div>
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Contact Us</h2>
              <p className="text-gray-400">Email: <span className="text-white">example@example.com</span></p>
              <p className="text-gray-400">Phone: <span className="text-white">+1234567890</span></p>
              <p className="text-gray-400">Address: <span className="text-white">123 Property Lane, Indore, India</span></p>
            </div>
            <div className="space-y-2 ml-auto">
              <h2 className="text-2xl font-semibold">Stay Connected</h2>
              <p className="text-gray-400">Follow us on social media or send us a message for more details.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <FontAwesomeIcon icon={faFacebookF} size="2x" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <FontAwesomeIcon icon={faTwitter} size="2x"/>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <FontAwesomeIcon icon={faInstagram} size="2x"/>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;