const mongoose=require("mongoose");
const orderSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    items:[{
        product:String,
        title:String,
        price:String,
        quantity:Number,
        subtotal:Number
    }],
    address:String,
    contact:String,
    total:Number,
    paymentMethod:{
        type:String,
        enum:["COD","Online"],
        required:true
    },
    paymentStatus: {
        type: String,
        default: "Pending"
    },

    orderStatus: {
        type: String,
        default: "Placed"
    },
    
razorpayOrderId: {
    type: String,
    unique: true,
    sparse: true
},

razorpayPaymentId: {
    type: String,
    default: null
},

currency: {
    type: String,
    default: "INR"
}

}, { timestamps: true });
module.exports = mongoose.model("Order", orderSchema);