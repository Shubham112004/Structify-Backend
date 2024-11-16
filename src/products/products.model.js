const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: true
    },
    oldPrice: {
        type: Number,
    },
    image: {
        type: String,
    },
    color: {
        type: String,
    },
    rating: {
        type: Number,
        default: 0
    },
    author: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
})

const Products = mongoose.model("Product", ProductSchema)
module.exports = Products