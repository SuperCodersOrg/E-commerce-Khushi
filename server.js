require('dotenv').config();

const express=require('express');
const port=process.env.PORT;
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");

// const cors=require('cors');
const app=express();

app.set("view engine", "ejs");
app.set("views", "./view");
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
// app.use(express.static("public"));


const path = require("path");
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.use("/public", express.static("public"));

const authRoutes=require('./routes/authroutes');
const homeRoutes = require("./routes/homeRoutes");
const productRoutes = require("./routes/product");

// connectDB();


app.use("/products", productRoutes);
app.use("/dashboard", homeRoutes);
app.use('/auth',authRoutes);


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