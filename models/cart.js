const mongoose = require("mongoose");
const User = require("./user");
const Product = require("./product")
const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true,
        unique: true

    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: Product,
            required: true
        },
        quantity: {
            type: Number,
            min: 1,
            default: 1,
            required: true
        }
    }]
},
    { timestamps: true }
)
module.exports = mongoose.model("Cart", cartSchema);