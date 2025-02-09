import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { assets } from '../assets/assets';
import { toast } from 'react-toastify';
import { AdminContext } from '../context/AdminContext';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const { token } = useContext(AdminContext);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) {
        console.error('No token available');
        toast.error('Please login again');
        return;
      }

      try {
        console.log('Fetching orders with token:', token);
        console.log('Backend URL:', backendUrl);

        const response = await axios.post(
          `${backendUrl}/api/order/list`, 
          {}, 
          { 
            headers: { 
              token: token,
              'Content-Type': 'application/json'
            } 
          }
        );

        console.log('Full response:', response);

        if (response.data.success) {
          console.log('Orders received:', response.data.orders);
          setOrders(response.data.orders.reverse());
        } else {
          console.error('Order fetch failed:', response.data.message);
          toast.error(response.data.message || 'Failed to fetch orders');
        }
      } catch (error) {
        console.error('Complete error details:', error);
        console.error('Error response:', error.response);
        toast.error(
          error.response?.data?.message || 
          error.message || 
          'Error fetching orders'
        );
      }
    };

    fetchOrders();
  }, [token]);

  const statusHandler = (e, orderId) => {
    axios.post(
      `${backendUrl}/api/order/status`, 
      { orderId, status: e.target.value }, 
      { headers: { token } }
    )
    .then(({ data }) => 
      data.success 
        ? (toast.success(data.message), 
           setOrders((prev) => prev.map((order) => 
             order._id === orderId 
               ? { ...order, status: e.target.value } 
               : order
           ))) 
        : toast.error(data.message)
    )
    .catch((error) => 
      toast.error(error.response?.data?.message || 'Error updating status')
    );
  };

  if (!token) {
    return <div>Please login to view orders</div>;
  }

  return (
    <div>
      <h3>Order Page</h3>
      {orders.length === 0 ? (
        <div>No orders found</div>
      ) : (
        orders.map((order) => (
          <div 
            key={order._id} 
            className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr] gap-3 border-2 p-5 my-3 text-xs text-gray-700"
          >
            <img className="w-12" src={assets.parcel_icon} alt="" />
            <div>
              {order.items.map((item) => (
                <p key={item._id}>
                  {item.name} x {item.quantity} <span>{item.size}</span>
                </p>
              ))}
              <p className="mt-3 font-medium">
                {order.address.firstName} {order.address.lastName}
              </p>
              <p>
                {`${order.address.street}, ${order.address.city}, ${order.address.state}, ${order.address.country}, ${order.address.zipcode}`}
              </p>
              <p>{order.address.phone}</p>
            </div>
            <div>
              <p>Items: {order.items.length}</p>
              <p>Method: {order.paymentMethod}</p>
              <p>Payment: {order.payment ? 'Done' : 'Pending'}</p>
              <p>Date: {new Date(order.date).toLocaleDateString()}</p>
            </div>
            <p>{currency}{order.amount}</p>
            <select 
              onChange={(e) => statusHandler(e, order._id)} 
              value={order.status} 
              className="p-2 font-semibold"
            >
              {['Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered'].map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;
