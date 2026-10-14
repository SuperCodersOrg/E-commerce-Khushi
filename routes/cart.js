const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authmiddleware");
const Product = require("../models/product");
const Cart = require("../models/cart");
const User = require("../models/user");
const Order = require("../models/order");
const mongoose = require('mongoose');
const Razorpay = require("razorpay");
const crypto = require("crypto");
const razorpay = require("../config/razorpay");

router.post("/load", authMiddleware, async (req, res) => {
    try {
        console.log("Logged in user:", req.user);
        const { productId } = req.body;
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        if (product.stock <= 0) {
            return res.status(400).json({
                message: "Product is out of stock"
            });
        }
        let cart = await Cart.findOne({
            user: req.user.userId
        });
        if (!cart) {
            cart = new Cart({
                user: req.user.userId,
                items: []
            });
        }
        const existingItem = cart.items.find(
            item => item.product.toString() === productId
        );
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.items.push({
                product: product._id,
                quantity: 1
            });
        }
        await cart.save();
        return res.status(200).json({
            message: "Product added to cart successfully"
        });
    } catch (error) {
        console.error("Add to cart error:", error);

        return res.status(500).json({
            message: "Something went wrong while adding to cart"
        });
    }
});
router.get("/page", authMiddleware, async (req, res) => {
    try {
        const cart = await Cart.findOne({
            user: req.user.userId
        }).populate("items.product");
        // if (cart && cart.items.length > 0) {
        //     for (const item of cart.items) {
        //         item.product = await Product.findById(item.product);
        //     }
        // }
        res.render("cart", { cart });
    } catch (error) {
        console.error("Load cart error:", error);
        res.status(500).send("Unable to load your cart.");
    }
});

router.post("/decrease/:id", authMiddleware, async function (req, res) {
    try {
        let cart = await Cart.findOne({
            user: req.user.userId
        });

        if (!cart) {
            // return res.redirect("/cart/page");
            res.status(200).json({ message: "Cart updated" });
        }

        for (let i = 0; i < cart.items.length; i++) {
            if (cart.items[i].product.toString() == req.params.id) {
                if (cart.items[i].quantity > 1) {
                    cart.items[i].quantity = cart.items[i].quantity - 1;
                }
                break;
            }
        }

        await cart.save();
        // res.redirect("/cart/page");
        res.status(200).json({ message: "Cart updated" });

    } catch (error) {
        console.log(error);
        res.status(500).send("Unable to decrease quantity");
    }
});

router.post("/increase/:id", authMiddleware, async function (req, res) {
    try {
        let cart = await Cart.findOne({
            user: req.user.userId
        });

        if (!cart) {
            // return res.redirect("/cart/page");
            res.status(200).json({ message: "Cart updated" });
        }

        for (let i = 0; i < cart.items.length; i++) {
            if (cart.items[i].product.toString() == req.params.id) {
                cart.items[i].quantity = cart.items[i].quantity + 1;
                break;
            }
        }

        await cart.save();
        // res.redirect("/cart/page");
        res.status(200).json({ message: "Cart updated" });

    } catch (error) {
        console.log(error);
        res.status(500).send("Unable to increase quantity");
    }
});

router.post("/remove/:id", authMiddleware, async function (req, res) {
    try {
        let cart = await Cart.findOne({
            user: req.user.userId
        });

        if (!cart) {
            // return res.redirect("/cart/page");
            res.status(200).json({ message: "Cart updated" });
        }
        let items = [];
        for (let i = 0; i < cart.items.length; i++) {
            if (cart.items[i].product.toString() != req.params.id) {
                items.push(cart.items[i]);
            }
        }
        cart.items = items;
        await cart.save();
        // res.redirect("/cart/page");
        res.status(200).json({ message: "Cart updated" });
    } catch (error) {
        console.log(error);
        res.status(500).send("Unable to remove product");
    }
});
// router.post("/place-order", authMiddleware, async (req, res) => {
//     try {

//         const { contact, address, paymentMethod } = req.body;
//         const cart = await Cart.findOne({ user: req.user.userId })
//             .populate("items.product");
//         let total = 0;
//         const orderItems = cart.items.map(item => {
//             const product = item.product;
//             const subtotal = product.price * item.quantity;
//             total += subtotal;
//             return{
//                 product:product._id.toString(),
//                 title:product.title,
//                 price:product.price,
//                 quantity:item.quantity,
//                 subtotal:subtotal
//             }
//         })
//         const order =new Order({
//             user:req.user.userId,
//             items:orderItems,
//             address:address,
//             contact:contact,
//             total:total,
//             paymentMethod:"COD",
//             paymentStatus:"Pending",
//             orderStatus:"Placed"

//         })
//         await order.save();
//         cart.items=[];
//         await cart.save();
//         res.status(201).json({
//             message:"Order placed successfully",
//             orderId:order._id
//         })
//     }
//     catch(error){
//         console.log(error);
//         res.status(500).json({
//             message:"Failed to place order"
//         })
//     }
//    })
router.post("/place-order", authMiddleware, async (req, res) => {
    try {

        const { contact, address, paymentMethod } = req.body;

        if (!["COD", "Online"].includes(paymentMethod)) {
            return res.status(400).json({ message: "Invalid payment method" });
        }

        if (!contact || !address) {
            return res.status(400).json({
                message: "Contact and address are required"
            });
        }
        const cart = await Cart.findOne({ user: req.user.userId })
            .populate("items.product");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        let subtotal = 0;
        const orderItems = [];
        for (let i = 0; i < cart.items.length; i++) {
            const item = cart.items[i];
            const product = item.product;
            if (!product) {
                return res.status(400).json({
                    message: "Prodcut no longer exist in your cart"
                })
            }
            const itemSubtotal = Number(product.price) * item.quantity;
            subtotal += itemSubtotal;
            orderItems.push({
                product: product._id.toString(),
                title: product.title,
                price: product.price,
                quantity: item.quantity,
                subtotal: itemSubtotal
            })
        }
        const tax = subtotal * 0.05;
        const delivery = subtotal >= 999 ? 0 : 50;
        const total = Number((subtotal + tax + delivery).toFixed(2));


        // const orderItems = cart.items.map(item => {
        //     const product = item.product;
        //     const subtotal = product.price * item.quantity;
        //     total += subtotal;
        //     return{
        //         product:product._id.toString(),
        //         title:product.title,
        //         price:product.price,
        //         quantity:item.quantity,
        //         subtotal:subtotal
        //     }
        // })
        const order = new Order({
            user: req.user.userId,
            items: orderItems,
            address: address,
            contact: contact,
            total: total,
            paymentMethod: paymentMethod,
            paymentStatus: "Pending",
            orderStatus: "Placed"

        })
        await order.save();
        if (paymentMethod === "COD") {
            cart.items = [];
            await cart.save();
            return res.status(201).json({
                message: "Order placed successfully",
                orderId: order._id
            })
        }
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(total * 100),
            currency: "INR",
            receipt: order._id.toString(),
            notes: {
                localOrderId: order._id.toString()
            }
        })
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();
        return res.status(201).json({
            message: "Proceed to payment",
            orderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to place order"
        })
    }
})
router.post("/verify-payment", authMiddleware, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                message: "Payment details are missing"
            });
        }
        const order = await Order.findOne({
            _id: req.body.orderId,
            user: req.user.userId,
            razorpayOrderId: razorpay_order_id
        })
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.paymentStatus === "Paid") {
            return res.json({ message: "Payment already verified" });
        }
        const generatedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");
        const signatureBuffer = Buffer.from(generatedSignature, "hex");
        const receivedBuffer = Buffer.from(razorpay_signature, "hex");
        if (
            signatureBuffer.length !== receivedBuffer.length ||
            !crypto.timingSafeEqual(signatureBuffer, receivedBuffer)
        ) {
            return res.status(400).json({
                message: "Invalid payment signature"
            });
        }
        order.razorpayPaymentId = razorpay_payment_id;
        order.paymentStatus = "Paid";
        order.orderStatus = "Placed";
        await order.save();
        const cart = await Cart.findOne({ user: req.user.userId });
        if (cart) {
            cart.items = [];
            await cart.save();
        }

        res.json({
            message: "Payment successful",
            orderId: order._id
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Payment verification failed" });
    }
})
router.post("/razorpay-webhook", async (req, res) => {
    try {
        const signature = req.headers["x-razorpay-signature"];
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error("Razorpay webhook secret is missing");
            return res.status(500)
            // .send("Webhook not configured");
        }
        if (!signature) {
            return res.status(400)}
            //  .send("Missing webhook signature");
           const expectedBuffer = Buffer.from(expectedSignature, "hex");
        const receivedBuffer = Buffer.from(signature, "hex");
       
        if (
            expectedBuffer.length !== receivedBuffer.length ||
            !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
        ) {
            return res.status(400).send("Invalid webhook signature");
        }
        const event =JSON.parse(req.body.toString("utf8"));
        if(event.event ==="payment.captured"){
              const payment = event.payload?.payment?.entity;

            if (!payment?.order_id || !payment?.id) {
                return res.status(400).send("Payment details missing");
            } 
             const order = await Order.findOne({
                razorpayOrderId: payment.order_id
            });

            if (order && order.paymentStatus !== "Paid") {
                order.paymentStatus = "Paid";
                order.razorpayPaymentId = payment.id;
                await order.save();
            }}
       else if (event.event === "payment.failed") {
            const payment = event.payload?.payment?.entity;

            if (payment?.order_id) {
                const order = await Order.findOne({
                    razorpayOrderId: payment.order_id
                });

                if (order && order.paymentStatus !== "Paid") {
                    order.paymentStatus = "Failed";
                    await order.save();
                }
            }
       }
        return res.status(200).json({ received: true });

    } catch (error) {
        console.error("Razorpay webhook error:", error);
        return res.status(500).send("Webhook processing failed");
    }
});
module.exports = router;
