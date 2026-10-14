
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Order = require("../models/order");
const Product = require("../models/product");
const authMiddleware = require("../middleware/authmiddleware");

router.get("/", authMiddleware, (req, res) => {
    User.findById(req.user.userId)
        .then((user) => {
            if (!user) {
                return res.status(404).send("User not found.");
            }
            return Product.find()
                .then((products) => {
                    res.render("home", {
                        products: products,
                        user: user
                    });
                });
        })
        .catch((error) => {
            res.status(500).send("Error loading homepage.");
        });
});
router.get("/profile", authMiddleware, (req, res) => {
    User.findById(req.user.userId)
        .then((user) => {
            if (!user) {
                return res.status(404).send("User not found.");
            } return res.render("profile", { user: user });
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send("Error loading profile.");
        });
});

router.get("/order-history", authMiddleware, function (req, res) {
    Order.find({ user: req.user.userId })
        .sort({ createdAt: -1 })
        .then(function (orders) {
            res.render("order-history", { orders: orders });
        })
        .catch(function (error) {
            console.log("Order history error:", error);
            res.status(500)
            // .send("Unable to load order history.");
        });
});

module.exports = router;
