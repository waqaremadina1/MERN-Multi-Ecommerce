import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    if (year !== currentYear) {
      setYear(currentYear);
    }
  }, [year]);

  return (
    <div>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
        <div>
          <img src={assets.logo} className='mb-5 w-32' alt="Logo" />
          <p className='w-full md:2/3 text-gray-600'>
            Thank you for shopping with us. Enjoy top-quality products, 
            fast shipping, and exceptional customer service. Happy shopping!
          </p>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>COMPANY</p>
          <ul className='flex flex-col gap-1 text-gray-600'>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About us</Link></li>
            <li><Link to="/orders">Delivery</Link></li>
            <li><Link to="/privacypolicy">Privacy policy</Link></li>
          </ul>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-1 text-gray-600'>
            <li><a href="tel:+923024402333">+92-302-4402333</a></li>
            <li><a href="mailto:waqaremadina1@gmail.com">waqaremadina1@gmail.com</a></li>
          </ul>
        </div>
      </div>

      <hr />
      
      {/* Footer Bottom Section */}
      <div className='footer-bottom'>
        {/* Social Media Icons */}
        <div className='social-icons'>
          <a href="https://facebook.com/waqaremadina1" target="_blank" rel="noopener noreferrer">
            <FaFacebookF className="text-gray-600 hover:text-blue-600 text-xl" />
          </a>
          <a href="https://instagram.com/waqaremadina1" target="_blank" rel="noopener noreferrer">
            <FaInstagram className="text-gray-600 hover:text-pink-500 text-xl" />
          </a>
          <a href="https://twitter.com/waqaremadina1" target="_blank" rel="noopener noreferrer">
            <FaTwitter className="text-gray-600 hover:text-blue-400 text-xl" />
          </a>
          <a href="https://linkedin.com/in/waqaremadina1" target="_blank" rel="noopener noreferrer">
            <FaLinkedin className="text-gray-600 hover:text-blue-700 text-xl" />
          </a>
        </div>

        {/* Copyright Text */}
        <p className='copyright-text'>
          &copy; {year} <a href="https://waqarjs.web.app" target='_blank'>Waqar-Codes.</a> All Rights Reserved.
        </p>
      </div>

    </div>
  );
}

export default Footer;
