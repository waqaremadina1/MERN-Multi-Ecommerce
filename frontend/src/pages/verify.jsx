import React, { useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';  // ✅ Import useNavigate
import axios from 'axios';
import { toast } from 'react-toastify';

const Verify = () => {
    const { token, setCartItems, backendUrl } = useContext(ShopContext);
    const navigate = useNavigate();  // ✅ Now useNavigate will work
    const [searchParams] = useSearchParams();

    const success = searchParams.get('success');
    const orderId = searchParams.get('orderId');

    const verifyPayment = async () => {
        try {
            if (!token) {
                return;
            }

            const response = await axios.post(`${backendUrl}/api/order/verifyStripe`, 
                { success, orderId }, 
                { headers: { token } }
            );

            if (response.data.success) {
                setCartItems({});
                navigate('/orders');  // ✅ Navigate after successful payment
                toast.success(response.data.message);
            } else {
                navigate('/cart');
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    useEffect(() => { 
        verifyPayment(); 
    }, []);

    return <div></div>;
};

export default Verify;
