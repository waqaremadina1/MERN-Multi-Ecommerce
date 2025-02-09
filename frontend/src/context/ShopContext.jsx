import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopProvider = ({ children }) => {
    const currency = "$";
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
    
    // Add console log for debugging
    console.log('Backend URL:', backendUrl);

    const [search, setSearch] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const navigate = useNavigate();

    // Load cart from localStorage and backend on mount
    useEffect(() => {
        const loadCart = async () => {
            // Load from localStorage first
            const storedCart = localStorage.getItem("cart");
            if (storedCart) {
                setCartItems(JSON.parse(storedCart));
            }

            // If user is logged in, sync with backend
            if (token) {
                try {
                    const response = await axios.post(`${backendUrl}/api/cart/get`, {}, { headers: { token } });
                    if (response.data.success && response.data.cart) {
                        setCartItems(response.data.cart);
                        localStorage.setItem("cart", JSON.stringify(response.data.cart));
                    }
                } catch (error) {
                    console.error("Failed to fetch cart from backend:", error);
                }
            }
        };

        loadCart();
    }, [token, backendUrl]);

    // Save cart to localStorage whenever it updates
    useEffect(() => {
        if (Object.keys(cartItems).length > 0) {
            localStorage.setItem("cart", JSON.stringify(cartItems));
        }
    }, [cartItems]);

    // Add to Cart
    const addToCart = async (itemId, size) => {
        if (!size) return toast.error("Select Product Size");

        let cartData = structuredClone(cartItems);
        cartData[itemId] = cartData[itemId] || {};
        cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
        setCartItems(cartData);

        if (token) {
            try {
                const response = await axios.post(
                    `${backendUrl}/api/cart/add`, 
                    { itemId, size }, 
                    { 
                        headers: { 
                            token,
                            'Content-Type': 'application/json'
                        } 
                    }
                );

                // Always show success toast, even if backend response is different
                toast.success("Add To Cart Successfully");
            } catch (error) {
                console.error('Add to cart error:', error);
                
                // Revert cart if backend add fails
                setCartItems(cartItems);
                
                // Show error toast with more informative message
                toast.error(
                    error.response?.data?.message || 
                    "Failed to update cart. Please try again."
                );
            }
        } else {
            // If no token, still show success and log
            console.warn('No token available for cart update');
            toast.success("Add To Cart Successfully");
        }
    };

    // Get Cart Count
    const getCartCount = () => {
        return Object.values(cartItems).reduce(
            (total, sizes) => total + Object.values(sizes).reduce((sum, qty) => sum + qty, 0),
            0
        );
    };

    // Update Quantity
    const updateQuantity = async (itemId, size, quantity) => {
        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            if (quantity > 0) {
                cartData[itemId][size] = quantity;
            } else {
                delete cartData[itemId][size];
                if (Object.keys(cartData[itemId]).length === 0) delete cartData[itemId];
            }
            setCartItems(cartData);

            if (token) {
                try {
                    const response = await axios.post(
                        `${backendUrl}/api/cart/update`, 
                        { itemId, size, quantity }, 
                        { 
                            headers: { 
                                token,
                                'Content-Type': 'application/json'
                            } 
                        }
                    );
                    
                    // Show "Update Cart" toast for any cart modification
                    toast.success("Update Cart");
                } catch (error) {
                    console.error('Cart update error:', error);
                    
                    // Revert cart if backend update fails
                    setCartItems(cartItems);
                    
                    // Show error toast
                    toast.error(
                        error.response?.data?.message || 
                        "Failed to update cart. Please try again."
                    );
                }
            } else {
                // If no token, still show update toast
                console.warn('No token available for cart update');
                toast.success("Update Cart");
            }
        }
    };

    // 💰 Get Cart Amount
    const getCartAmount = () => {
        // If no cart items, return 0
        if (!cartItems || Object.keys(cartItems).length === 0) {
            return 0;
        }

        // If no products loaded, return 0
        if (!products || products.length === 0) {
            return 0;
        }

        return Object.entries(cartItems).reduce((totalAmount, [itemId, sizeQuantities]) => {
            const itemInfo = products.find((p) => p._id === itemId);
            
            // If product not found, skip this item
            if (!itemInfo) {
                console.warn(`Product with ID ${itemId} not found in products list`);
                return totalAmount;
            }

            // Calculate total for this item across all sizes
            const itemTotal = Object.entries(sizeQuantities).reduce((sum, [size, quantity]) => {
                return sum + (itemInfo.price * quantity);
            }, 0);

            return totalAmount + itemTotal;
        }, 0);
    };

    // Get Products Data
    const getProductsData = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/product/list`);
            if (response.data.success) {
                const updatedProducts = response.data.products.map((product) => ({
                    ...product,
                    image: Array.isArray(product.image) && product.image.length > 0
                        ? product.image[0].startsWith("http") ? product.image[0] : `${backendUrl}/${product.image[0]}`
                        : "/default-image.jpg"
                }));
                setProducts(updatedProducts);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch products");
        }
    };

    // Get User Cart from API
    const getUserCart = async (token) => {
        try {
            const response = await axios.post(`${backendUrl}/api/cart/get`, {}, { headers: { token } });
            if (response.data.success) {
                setCartItems(response.data.cartData);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load cart");
        }
    };

    // Load Products & User Cart on Mount
    useEffect(() => {
        getProductsData();
        if (token) getUserCart(token);
    }, [token]);

    const value = {
        products,
        currency,
        delivery_fee,
        search,
        setSearch,
        showSearch,
        setShowSearch,
        cartItems,
        setCartItems,
        addToCart,
        getCartCount,
        updateQuantity,
        getCartAmount,
        navigate,
        backendUrl,
        setToken,
        token,
        getProductsData,
    };

    return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopProvider;
