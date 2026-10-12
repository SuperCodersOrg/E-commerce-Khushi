
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/user");
const connectDB = require("./config/db");

const users = [
    {
        username: "sanchi",
        email: "sanchi.bareja2008@example.com",
        password: "1234"
    },
    {
        username: "prachi",
        email: "testuser2@example.com",
        password: "1234"
    },
    {
        username: "mahak",
        email: "testuser3@example.com",
        password: "1234"
    },
    {
        username: "priya",
        email: "testuser4@example.com",
        password: "1234"
    },
    {
        username: "savi",
        email: "testuser5@example.com",
        password: "1234"
    }
];

connectDB()
    .then(() => {
        return Promise.all(
            users.map((user) => {
                return bcrypt.hash(user.password, 10)
                    .then((hashedPassword) => {
                        return User.updateOne(
                            { username: user.username },
                            {
                                $setOnInsert: {
                                    username: user.username,
                                    email: user.email,
                                    password: hashedPassword,
                                    isVerified: true
                                }
                            },
                            { upsert: true }
                        );
                    });
            })
        );
    })
    .then(() => {
        console.log("Test users inserted or already exist.");
    })
    .catch((error) => {
        console.error("Error inserting test users:", error);
    })
    .finally(() => {
        return mongoose.disconnect();
    });
