import React from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';

const Navbar = ({ onLogout }) => {
  return (
    <div className='flex items-center py-2 px-[4%] justify-between'>
      <Link to='/'><img className='w-[max(10%,80px)]' src={assets.logo} alt="Logo" /></Link>
      <div className='flex items-center gap-4'>
        <Link to='/profile' className='text-gray-600 hover:text-gray-800'>Profile</Link>
        <button 
          onClick={onLogout} 
          className='bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm cursor-pointer hover:bg-gray-700'
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;