import userModel from "../models/userModel.js";
// import productModel from "../models/productModel.js";

// add product to user cart 
const addToCart = async (req, res) => {

    try {

        const { userId, itemId, size } = req.body

        const userData = await userModel.findById(userId)
        let cartData = userData.cartData

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1
            } else {
                cartData[itemId][size] = 1
            }
        } else {
            cartData[itemId] = {}
            cartData[itemId][size] = 1
        }

        await userModel.findByIdAndUpdate(userId, { cartData })
        res.json({ success: true, message: "Added to Cart" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

const updateCart = async (req, res) => {
    try {
        const { userId, itemId, size, quantity } = req.body;

        const userData = await userModel.findById(userId);
        let cartData = userData.cartData;

        // Update quantity or remove size
        if (cartData[itemId]) {
            if (quantity > 0) {
                cartData[itemId][size] = quantity;
            } else {
                delete cartData[itemId][size];
                // Remove the entire item if no sizes are left
                if (Object.keys(cartData[itemId]).length === 0) {
                    delete cartData[itemId];
                }
            }
        }

        // Save the updated cart data to the database
        await userModel.findByIdAndUpdate(userId, { cartData });
        res.json({ success: true, message: "Cart Updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// get user cart 
const getUserCart = async (req, res) => {

    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId)
        let cartData = userData.cartData
                                                                                                                  
        res.json({ success: true, cartData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

export { addToCart, updateCart, getUserCart }