import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import RelatedProducts from '../components/RelatedProducts';

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, token } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [size, setSize] = useState('');

  const fetchProductData = () => {
    const product = products.find(item => item._id === productId);
    if (product) {
      setProductData(product);

      // 🖼️ Handle single/multiple images
      if (Array.isArray(product.image) && product.image.length > 0) {
        setCurrentImage(product.image[0]); // Use first image if array
      } else {
        setCurrentImage(product.image || '/default-image.jpg'); // Use single image or default
      }
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  if (!productData) {
    return <div>Loading...</div>;
  }

  // 🖼️ Get all available images safely
  const productImages = Array.isArray(productData.image) ? productData.image : [productData.image];

  return (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/* Product Data */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>

        {/* Product Images */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
            {productImages.map((image, index) => (
              <img 
                key={index} 
                onClick={() => setCurrentImage(image)} 
                src={image} 
                className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' 
                alt={`${productData.name} view ${index + 1}`} 
              />
            ))}
          </div>
          <div className='w-full sm:w-[80%]'>
            <img src={currentImage} className='w-full' alt={productData.name} />
          </div>
        </div>

        {/* Product Info */}
        <div className='flex-1 space-y-6'>
          <div>
            <h1 className='text-2xl font-medium'>{productData.name}</h1>
            <p className='text-gray-500 text-sm'>By {productData.adminName}</p>
          </div>
          <p className='text-2xl font-medium'>{currency}{productData.price}</p>
          <p className='text-gray-500'>{productData.description}</p>

          {/* Size Selection */}
          <div>
            <p className='font-medium mb-2'>Select Size</p>
            <div className='flex gap-3'>
              {productData.sizes.map((item, index) => (
                <div
                  key={index}
                  onClick={() => setSize(item)}
                  className={`px-3 py-2 border cursor-pointer ${size === item ? 'border-black' : 'border-gray-300'}`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={() => {
              if (!token) {
                toast.error('Please login first');
                return;
              }
              addToCart(productData._id, size);
            }}
            className='w-50 bg-black text-white py-4 hover:opacity-80 cursor-pointer'
          >
            ADD TO CART
          </button>
        </div>
      </div>

      {/* Description & Review Section */}
      <div className='mt-20'>
        <div className='flex'>
          <b className='border px-5 py-3 text-sm'>Description</b>
          <p className='border px-5 py-3 text-sm'>Reviews (122)</p>
        </div>
        <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
          <p>An e-commerce website is an online platform that facilitates the buying and selling of products or services over the internet...</p>
          <p>E-commerce websites typically display products or services along with detailed descriptions, images, prices, and any available variations...</p>
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
    </div>
  );
};

export default Product;
