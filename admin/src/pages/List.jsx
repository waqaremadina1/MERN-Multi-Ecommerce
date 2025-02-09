import axios from 'axios'
import React, { useEffect, useState, useContext } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { AdminContext } from '../context/AdminContext'

const List = () => {
  const { token } = useContext(AdminContext)
  const [list, setList] = useState([])
 
  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/admin-products', {
        headers: { token }
      })
      if (response.data.success) {
        // console.log("Received products data:", response.data.products);
        setList(response.data.products);
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message)
    } 
  }

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(backendUrl + '/api/product/remove', {id}, {
        headers: { token }
      })
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList();
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    if (token) {
      fetchList()
    }
  }, [token])

  const getImageUrl = (item) => {
    if (!item.image) return 'https://via.placeholder.com/150';
    if (Array.isArray(item.image) && item.image.length > 0) return item.image[0];
    if (typeof item.image === 'string') return item.image;
    return 'https://via.placeholder.com/150';
  }
 
  return (
    <div>
      <h1 className='text-2xl font-semibold'>Products List</h1>
      <div className='mt-8 space-y-4'>
        {list.map((item) => (
          <div key={item._id} className='bg-white p-4 rounded-lg shadow flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='w-16 h-16 relative'>
                <img 
                  src={getImageUrl(item)}
                  alt={item.name} 
                  className='w-full h-full object-cover rounded absolute top-0 left-0'
                  onError={(e) => {
                    // console.log("Image failed to load:", e.target.src);
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/150';
                  }}
                />
              </div>
              <div>
                <h2 className='font-medium'>{item.name}</h2>
                <p className='text-sm text-gray-500'>{item.description}</p>
                <p className='text-sm font-medium'>{currency}{item.price}</p>
              </div>
            </div>
            <button 
              onClick={() => removeProduct(item._id)} 
              className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer'
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default List