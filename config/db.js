require('dotenv').config();
const mongoose = require("mongoose");
function connectDB() {
    return mongoose.connect(process.env.MONGODB_URI)
      .then(() => {
            console.log("MongoDB connected");
        })
        .catch((error) => {
            console.log("MongoDB connection failed:", error.message);
        });
}
module.exports = connectDB;