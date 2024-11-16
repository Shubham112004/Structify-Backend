const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
require('dotenv').config();

const uploadImage = require("./src/utils/uploadImage");

const app = express();

// Middlewares
app.use(express.json({ limit: "25mb" }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: ['http://localhost:5173', 'https://e-commerce-frontend-seven-mu.vercel.app'],
    credentials: true,
}));

// Routes
const authRoutes = require('./src/users/user.route');
const productRoutes = require('./src/products/products.route');
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// MongoDB Connection
mongoose.connect(process.env.DB_URL)
    .then(() => console.log("MongoDB successfully connected"))
    .catch((err) => console.error(err));

// Default Route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Upload Image Route
app.post("/uploadImage", (req, res) => {
    uploadImage(req.body.image)
        .then((url) => res.send(url))
        .catch((err) => res.status(500).send(err));
});

// Export app for Vercel
module.exports = app;
