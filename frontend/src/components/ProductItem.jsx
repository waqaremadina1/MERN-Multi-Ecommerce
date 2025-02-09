import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import {Link} from 'react-router-dom'

const ProductItem = ({id, image, name, price, adminName}) => {
    const {currency} = useContext(ShopContext);

    const handleImageError = (e) => {
        console.log('Image failed to load:', image);
        e.target.onerror = null; // Prevent infinite loop
        e.target.src = 'https://via.placeholder.com/300x400?text=Image+Not+Found';
    };

    return (
        <Link className='text-gray-700 cursor-pointer' to={`/product/${id}`}>
            <div className='overflow-hidden'>
                <img 
                    className='hover:scale-110 transition-in-out' 
                    src={image} 
                    alt={name}
                    onError={handleImageError}
                    onLoad={() => console.log('Image loaded successfully:', image)}
                />
            </div>
            <p className='pt-3 pb-1 text-sm'>{name}</p>
            <p className='text-xs text-gray-500'>By {adminName}</p>
            <p className='text-sm font-medium'>{currency}{price}</p>
        </Link>
    )
}

export default ProductItem