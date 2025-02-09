import React, { useState, useEffect, useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import axios from 'axios'

const OrderTrackingModal = ({ isOpen, onClose, currentStatus }) => {
  const orderStatuses = ['Order Placed', 'Processing', 'Packing', 'Out for Delivery', 'Delivered'];
  
  const getStatusIndex = (status) => {
    return orderStatuses.findIndex(s => s.toLowerCase() === status.toLowerCase());
  }

  const currentStatusIndex = getStatusIndex(currentStatus);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[90%] max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Order Tracking</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-8">
          {orderStatuses.map((status, index) => (
            <div key={status} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                ${index <= currentStatusIndex 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-300 text-gray-300'}`}>
                {index <= currentStatusIndex ? '✓' : (index + 1)}
              </div>
              <div className={`ml-4 flex-1 ${index <= currentStatusIndex ? 'text-green-500 font-medium' : 'text-gray-400'}`}>
                {status}
              </div>
              {index < orderStatuses.length - 1 && (
                <div className={`flex-1 h-1 mx-2 ${index < currentStatusIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Orders = () => {

  const {backendUrl, token, currency} = useContext(ShopContext);

  const [orderData, setOrderData] = useState([])

  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null
      }

      const response = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } })
      if (response.data.success) {
        let allOrdersItems = []
        response.data.orders.map((order) => {
          order.items.map((item) => {
            item['status'] = order.status
            item['date'] = order.date
            item['payment'] = order.payment
            item['paymentMethod'] = order.paymentMethod
            allOrdersItems.push(item)
          })
        })
        setOrderData(allOrdersItems.reverse())
      }

    } catch (error) {

    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      loadOrderData()
    }, 2000) // Refresh every 2 seconds
    
    loadOrderData() // Initial load
    
    return () => clearInterval(interval)
  }, [token])

  return (

    <div className='border-t pt-16'>
    <div className="text-2xl">
      <Title text1={'MY'} text2={'ORDERS'} />
    </div>
    <div>
      {
        orderData.map((item, i) => (
          <div key={i} className='py-4 border-b text-gray-700 flex flex-col md:flex-row md: items-center md:justify-between gap-4' >
            <div className="flex items-start gap-6 text-sm">
              <img className='w-16 sm:w-20' src={item.image && item.image.length > 0 ? item.image[0] : ''} alt="" />
              <div>
                <p className='sm:text-base font-medium'>{item.name}</p>
                <p className='text-xs text-gray-500'>By {item.adminName || 'Unknown Admin'}</p>
                <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                  <p >{currency}{item.price}</p>
                  <p>Quantity : {item.quantity}</p>
                  <p> Size : {item.size} </p>
                </div>
                <p className='mt-1'>Date : <span className='text-gray-400'>{new Date(item.date).toDateString()}</span></p>
                <p className='mt-1'>Payment : <span className='text-gray-400'>{item.paymentMethod}</span></p>
              </div>
            </div>
            <div className='md:w-1/2 flex justify-between'>
              <div className="flex items-center gap-2">
                <p className='min-w-2 h-2 rounded-full bg-green-500'></p>
                <p className='text-sm md:text-base '>{item.status}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(item)} 
                className='border px-4 py-2 text-sm font-medium rounded-sm cursor-pointer hover:bg-gray-50'
              >
                Track Order
              </button>
            </div>
          </div>
        ))
      }
      <OrderTrackingModal 
        isOpen={selectedOrder !== null}
        onClose={() => setSelectedOrder(null)}
        currentStatus={selectedOrder?.status || ''}
      />
    </div>
  </div>
  )
}

export default Orders