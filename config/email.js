require('dotenv').config();
const nodemailer=require("nodemailer");
const email=process.env.EMAIL_USER;
const pass=process.env.EMAIL_PASS;
const transporter=nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: email,
        pass: pass
    }
})
// transporter.verify()
//     .then(() => {
//         console.log("Email server connected successfully");
//     })
//     .catch((err) => {
//         console.log("Email connection failed:", err.message);
//     });

module.exports=transporter;
