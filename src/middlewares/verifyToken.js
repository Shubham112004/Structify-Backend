const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET_KEY;

const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
        console.log("Token from request:", token);


        if (!token) {
            return res.status(401).send({ message: "No token provided" });
        }

        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach user info to request
        req.userId = decoded.userId;
        req.role = decoded.role;

        next();  // Proceed to the next middleware
    } catch (error) {
        console.error("Error while verifying token", error);

        if (error.name === "TokenExpiredError") {
            res.status(401).send({ message: "Token expired" });
        } else if (error.name === "JsonWebTokenError") {
            res.status(401).send({ message: "Invalid token" });
        } else {
            res.status(401).send({ message: "Token verification failed" });
        }
    }
};

module.exports = verifyToken;
