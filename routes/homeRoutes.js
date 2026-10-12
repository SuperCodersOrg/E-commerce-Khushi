
const express = require("express");
const router = express.Router();
const User = require("../models/user");
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
router.get("/profile",authMiddleware,(req,res)=>{
    User.findById(req.user.userId)
     .then((user) => {
            if (!user) {
                return res.status(404).send("User not found.");
            }  return res.render("profile", { user: user });
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send("Error loading profile.");
        });
});


module.exports = router;
