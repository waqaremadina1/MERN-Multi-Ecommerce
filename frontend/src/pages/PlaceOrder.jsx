import React, { useContext, useState, useEffect } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const PlaceOrder = () => {
  const [method, setMethod] = useState('cod');
  const { backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products, getProductsData, navigate, getCartCount } = useContext(ShopContext);

  useEffect(() => {
    if (!products.length) getProductsData();
  }, [products, getProductsData]);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', street: '', city: '', state: '', zipcode: '', country: '', phone: ''
  });

  const onChangeHandler = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        if (!token) {
            toast.error('Please login to place order');
            return navigate('/login');
        }

        if (getCartCount() === 0) {
            return toast.error('Your cart is empty');
        }

        for (const [key, value] of Object.entries(formData)) {
            if (!value.trim()) {
                return toast.error(`Please enter your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
            }
        }

        let orderItems = [];
        let updatedCart = { ...cartItems };
        let hasInvalidItems = false;

        for (const itemId in cartItems) {
            const product = products.find((p) => p._id === itemId);
            if (!product) {
                delete updatedCart[itemId];
                hasInvalidItems = true;
                continue;
            }

            for (const size in cartItems[itemId]) {
                const quantity = cartItems[itemId][size];
                if (quantity > 0) {
                    orderItems.push({
                        _id: product._id,  
                        productId: product._id,  
                        name: product.name,
                        price: product.price,
                        image: product.image?.[0] || '',
                        size,
                        quantity
                    });
                }
            }
        }

        if (hasInvalidItems) {
            setCartItems(updatedCart);
            toast.error('Some invalid items were removed from your cart');
            return;
        }

        if (orderItems.length === 0) {
            return toast.error('No valid items in cart');
        }

        const orderData = {
            address: formData,
            items: orderItems,
            amount: getCartAmount() + delivery_fee,
            paymentMethod: method
        };

        const endpoint = method === 'cod' ? '/api/order/place' : '/api/order/stripe';
        
        const response = await axios.post(
            `${backendUrl}${endpoint}`,
            orderData,
            { 
                headers: { 
                    token,
                    'Content-Type': 'application/json'
                } 
            }
        );

        if (response.data.success) {
            setCartItems({});
            localStorage.removeItem('cart');
            
            if (method === 'cod') {
                navigate('/orders');
                toast.success('Order placed successfully!');
            } else {
                window.location.href = response.data.session_url;
            }
        } else {
            toast.error(response.data.message || 'Failed to place order');
        }
    } catch (error) {
        console.error('Order placement error:', error);
        toast.error(error.response?.data?.message || 'An error occurred while placing the order');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
      
      {/* Left Side - Delivery Information */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1="DELIVERY " text2="INFORMATION" />
        </div>

        {/* First Name & Last Name */}
        <div className="flex gap-3">
          <input required className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="text" placeholder="First Name" name="firstName" value={formData.firstName} onChange={onChangeHandler} />
          <input required className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="text" placeholder="Last Name" name="lastName" value={formData.lastName} onChange={onChangeHandler} />
        </div>

        <input required className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="email" placeholder="Email" name="email" value={formData.email} onChange={onChangeHandler} />
        <input required className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="text" placeholder="Street" name="street" value={formData.street} onChange={onChangeHandler} />

        {/* City & State */}
        <div className="flex gap-3">
          <input required className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="text" placeholder="City" name="city" value={formData.city} onChange={onChangeHandler} />
          <input required className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="text" placeholder="State" name="state" value={formData.state} onChange={onChangeHandler} />
        </div>

        {/* Zipcode & Country */}
        <div className="flex gap-3">
          <input required className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="number" placeholder="Zipcode" name="zipcode" value={formData.zipcode} onChange={onChangeHandler} />
          <input required className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="text" placeholder="Country" name="country" value={formData.country} onChange={onChangeHandler} />
        </div>

        <input required className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="number" placeholder="Phone Number" name="phone" value={formData.phone} onChange={onChangeHandler} />
      </div>

      {/* Right Side - Payment & Cart */}
      <div className="mt-8 min-w-80">
        <CartTotal />
        <div className="mt-12">
          <Title text1="PAYMENT" text2="METHOD" />
          
          <div className="flex gap-3 flex-col lg:flex-row">
            {/* <div onClick={() => setMethod('stripe')} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`} />
              <img className="h-5 mx-4" src={assets.stripe_logo} alt="Stripe" />
            </div> */}
            <div onClick={() => setMethod('cod')} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`} />
              <p className="text-gray-500 text-sm font-medium mx-4">CASH ON DELIVERY</p>
            </div>
          </div>

          <div className="w-full text-end mt-8">
            <button type="submit" className="bg-black text-white px-16 py-3 text-sm rounded-md cursor-pointer">PLACE ORDER</button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
