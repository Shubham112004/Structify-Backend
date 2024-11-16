const jwt = require('jsonwebtoken');
const User = require('../users/user.model');
const JWT_SECRET = process.env.JWT_SECRET_KEY;

const generateToken = async (userId) => {
    if (!JWT_SECRET) {
        console.error("JWT secret key is missing");
        throw new Error("JWT secret key is missing");
    }
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found.");
        }
        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        return token;
    } catch (error) {
        console.error("Error generating token", error);
        throw new Error("Token generation failed");
    }
};

module.exports = generateToken;
