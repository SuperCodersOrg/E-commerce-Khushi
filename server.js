require('dotenv').config();

const express=require('express');
const port=process.env.PORT;
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const User=require("./models/user");
const Product=require("./models/product");

const cors=require('cors');
const app=express();

app.set("view engine", "ejs");
app.set("views", "./view");
app.use(
    "/cart/razorpay-webhook",
    express.raw({ type: "application/json" })
);
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
// app.use(express.static("public"));


const path = require("path");
// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "public", "index.html"));
// });
// app.get("/", (req, res) => {
//     Product.find()
//         .sort({ _id: -1 })
//         .limit(6)
//         .then((products) => {
//             const token = req.cookies.accessToken;
//             if (!token) {
//                 return res.render("home", { products, user: null });
//             }

//             jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
//                 if (error || !decoded || !decoded.userId) {
//                     return res.render("home", { products, user: null });
//                 }
//                 User.findById(decoded.userId)
//                     .then((user) => res.render("home", { products, user: user || null }))
//                     .catch(() => res.render("home", { products, user: null }));
//             });
//         })
//         .catch((error) => {
//             console.log(error);
//             res.status(500).send("Error loading homepage.");
//         });
// });
app.get("/",(req, res) => {
    //   User.findById(req.user.userId)
    //     .then((user) => {
    //         if (!user) {
    //             return res.status(404).send("User not found.");
    //         }
    //         return
     Product.find()
                .then((products) => {
                    res.render("index", {
                        products: products,
                        });
                })
        // })
        .catch((error) => {
            res.status(500).send("Error loading homepage.");
        });
});
app.use("/public", express.static("public"));

const authRoutes=require('./routes/authroutes');
const homeRoutes = require("./routes/homeRoutes");
const productRoutes = require("./routes/product");
const cartRoutes=require("./routes/cart");

// connectDB();


app.use("/products", productRoutes);
app.use("/dashboard", homeRoutes);
app.use('/auth',authRoutes);
app.use("/cart",cartRoutes);


// app.listen(port,()=>{
//     console.log("SERVER RUNNING");
// })
connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log("SERVER RUNNING");
        });
    })
    .catch((error) => {
        console.log("Database connection failed:", error.message);
    });