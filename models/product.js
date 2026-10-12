
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            
        },
        description: {
            type: String,
            required: true
        },
        images: {
            type: [String],
            required: true
        },
            price: {
            type: Number,
            required: true,
            min: 0
        },
        brand: {
            type: String,
            required: true,
            
        },
        category: {
            type: String,
            required: true,
            enum: [
                "men-clothing",
                "women-clothing",
                "electronics",
                "cosmetics"
            ]
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },
        attributes: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Product", productSchema);
