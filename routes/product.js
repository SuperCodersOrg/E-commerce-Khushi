
const express = require("express");
const router = express.Router();

const Product = require("../models/product");

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
