import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
    const token = req.headers.token;
    if (!token) {
        return res.json({ success: false, message: "Not Authorized. Login Again." });
    }
    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: tokenDecode.id }; // 👈 Update here
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export default authUser;
