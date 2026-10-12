
const express = require("express");
const router = express.Router();

const Product = require("../models/product");
const mongoose = require("mongoose");

// router.get("/", (req, res) => {
//     Product.find()
//         .then((products) => {
//             res.status(200).json(products);
//         })
//         .catch((error) => {
//             res.status(500).json({
//                 message: "Error fetching products",
//                 error: error.message
//             });
//         });
// });

router.get("/load-more", (req, res) => {
    const limit = 6;
    const cursor = req.query.cursor;
    let query = {};
    if (cursor) {
        if (!mongoose.isValidObjectId(cursor)) {
            return res.status(400).json({
                message: "INVALID ID"
            });        }

        query._id = { $lt: cursor };
    }

    Product.find(query)
        .sort({ _id: -1 })
        .limit(limit + 1)
        .then((products) => {
            const moreProduct = products.length > limit;
            const items = products.slice(0, limit);
            res.json({
                products: items,
                nextCursor: moreProduct
                    ? items[items.length - 1]._id
                    : null,
                moreProduct: moreProduct
            });
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({
                message: "Unable to load data"
            });
        });
});
router.get("/:id",(req,res)=>{
    const productId=req.params.id;
    Product.findById(productId)
    .then((product)=>{
        if(!product){
             return res.status(404).send("Product not found");
        }
         res.render("product-detail", { product: product });
        })
         .catch((error) => {
            console.log(error);
            res.status(500).send("Something went wrong");
        });
});
 


module.exports = router;
