import React, { useState } from 'react'
import {assets} from '../assets/assets'
import { NavLink, Link } from 'react-router-dom'
import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import ProfileModal from './ProfileModal'

const Navbar = () => {

const [visible, setVisible] = useState(false);
const [showProfileModal, setShowProfileModal] = useState(false);
const {setShowSearch, getCartCount, navigate, token, setToken, setCartItems} = useContext(ShopContext);

const logout = () => {
  navigate('/login')
  localStorage.removeItem('token')
  setToken('')
  setCartItems({})
}

const handleSearchClick = () => {
  navigate('/collection');
  setShowSearch(true);
}

return (
  <div className='flex items-center justify-between py-5 font-medium'>
      <Link to='/'> <img src={assets.logo} className='w-36' alt="" /></Link>
      <ul className='hidden sm:flex gap-5 text-sm text-gray-700 '>

          <NavLink to='/' className='flex flex-col items-center gap-1'>
              <p>HOME</p>
              <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden ' />
          </NavLink>

          <NavLink to='/collection' className='flex flex-col items-center gap-1'>
              <p>COLLECTIONS</p>
              <hr className='w-2/4 border-none h-[1.5px] bg-gray-700  hidden' />
          </NavLink>

          <NavLink to='/about' className='flex flex-col items-center gap-1'>
              <p>ABOUT</p>
              <hr className='w-2/4 border-none h-[1.5px] bg-gray-700  hidden' />
          </NavLink>

          <NavLink to='/contact' className='flex flex-col items-center gap-1'>
              <p>CONTACT</p>
              <hr className='w-2/4 border-none h-[1.5px] bg-gray-700  hidden' />
          </NavLink>

          <NavLink to='https://waqarjs.web.app' className='flex flex-col items-center gap-1'>
              <p>SELL</p>
              <hr className='w-2/4 border-none h-[1.5px] bg-gray-700  hidden' />
          </NavLink>

      </ul>
      <div className='flex items-center gap-6'>
          <img onClick={handleSearchClick} src={assets.search_icon} className='w-5 cursor-pointer' alt="" />
          <div className="group relative">
              <img onClick={() => token ? null : navigate('/login')} src={assets.profile_icon} className='w-5 cursor-pointer' alt="" />
              {token &&
                  <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4'>
                      <div className='flex flex-col gap-2 w-36 px-5 py-4  bg-slate-100 text-gray-500 rounded'>
                          <p onClick={() => setShowProfileModal(true)} className='cursor-pointer hover:text-black'>My Profile</p>
                          <p className='cursor-pointer hover:text-black' onClick={() => navigate('/orders')} >Orders</p>
                          <p className='cursor-pointer hover:text-black' onClick={() => logout()}>Logout</p>
                      </div>
                  </div>}
          </div>
          {token && (
            <Link to='/cart' className='relative'>
                <img src={assets.cart_icon} className='w-5 min-w-5' alt="" />
                <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'>{getCartCount()}</p>
            </Link>
          )}
          <img onClick={() => { setVisible(true) }} src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden' alt="" />
      </div>

      {/* sidebar menu for small screen  */}
      <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? 'w-full' : 'w-0'}`}>
          <div className='flex flex-col text-gray-600'>
              <div className='flex items-center gap-4 p-3'>
                  <img onClick={() => { setVisible(false) }} src={assets.dropdown_icon} className='h-4 rotate-180 cursor-pointer' alt="" />
                  <p>Back</p>
              </div>
              <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/' >HOME</NavLink>
              <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/collection' >COLLECTION</NavLink>
              <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/about' >ABOUT</NavLink>
              <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/contact' >CONTACT</NavLink>
          </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />

  </div >
)
}

export default Navbar