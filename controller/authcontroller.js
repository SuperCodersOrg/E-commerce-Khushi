require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Verification = require("../models/verification");
const transporter = require("../config/email");
const User = require("../models/user");
const port = process.env.PORT;
const sendVerification = (req, res) => {
    const email = req.body.email;
    if (!email) {
        return res.status(400).send("EMAIL IS REQUIRED");
    }
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    Verification.findOne({ email: email })
        .then((record) => {
            if (record) {
                record.token = hashedToken;
                record.expiresAt = expiresAt;
                record.isVerified = false;
                return record.save();
            }
            return Verification.create({
                email: email,
                token: hashedToken,
                expiresAt: expiresAt
            });
        })
        .then(() => {
            const link = `http://localhost:${port}/auth/verify-email?token=${token}`;
            return transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Verify your email",
                text: `Click this link to verify your email: ${link}`
            });
        })
        .then(() => {
            console.log("send");
            // res.send("Verification email sent. Check your inbox.");
            return res.redirect("/public/emailverify.html?status=sent");
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send("Could not send verification email.");
        });
};
const verifyEmail = (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.status(400).send("Verification token is missing.");
    }
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    Verification.findOne({
        token: hashedToken,
        expiresAt: { $gt: new Date() },
        isVerified: false
    })
        .then((record) => {
            if (!record) {
                return null;
            }
            const signupToken = crypto.randomBytes(32).toString("hex");
            const hashedSignupToken = crypto.createHash("sha256").update(signupToken).digest("hex");
            record.isVerified = true;
            record.token = null;
            record.signupToken = hashedSignupToken;
            record.signupTokenExpiresAt = new Date(
                Date.now() + 15 * 60 * 1000
            );
            return record.save().then(() => signupToken);
        })
        .then((signupToken) => {
            if (!signupToken) {
                return res.status(400).send(
                    "Invalid or expired verification link."
                );
            }
            res.cookie("signupToken", signupToken, {
                httpOnly: true,
                maxAge: 15 * 60 * 1000
            });
            return res.redirect("/public/signin.html");
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send("Verification failed.");
        });
};
const completeSignup = (req, res) => {
    const { username, password } = req.body;
    const signupToken = req.cookies.signupToken;
    if (!username || !password) {
        return res.status(400).send("Username and password are required.");
    }
    if (!signupToken) {
        return res.status(401).send("Please verify your email first.");
    }
    const hashedSignupToken = crypto.createHash("sha256").update(signupToken).digest("hex");
    Verification.findOne({
        signupToken: hashedSignupToken,
        signupTokenExpiresAt: { $gt: new Date() },
        isVerified: true
    })
        .then((record) => {
            if (!record) {
                return null;
            }

            return User.findOne({ email: record.email })
                .then((existingUser) => {
                    if (existingUser) {
                        return { error: "This email already has an account." };
                    }
                    return User.findOne({ username: username })
                        .then((existingUsername) => {
                            if (existingUsername) {
                                return { error: "Username already exists." };
                            }
                            return bcrypt.hash(password, 10)
                                .then((hashedPassword) => {
                                    return User.create({
                                        email: record.email,
                                        username: username,
                                        password: hashedPassword,
                                        isVerified: true
                                    });
                                })
                                .then(() => {
                                    record.signupToken = null;
                                    record.signupTokenExpiresAt = null;
                                    return record.save();
                                });
                        });
                });
        })
        .then((result) => {
            if (!result) {
                return res.status(401).send(
                    "Signup token is invalid or expired. Verify your email again."
                );
            }
            if (result.error) {
                return res.status(400).send(result.error);
            }
            res.clearCookie("signupToken");
            return res.redirect("/profile");
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send("Could not create account.");
        });
};
const login = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send("Username and password are required.");
    }
        User.findOne({ username: username })
        .select("+password")
        .then((user) => {
            if (!user) {
                // return res.status(401).send("Invalid username or password.");
                 return res.redirect("/public/login.html?status=invalid");
            }
            return bcrypt.compare(password, user.password)
                .then((isMatch) => {
                    if (!isMatch) {
                        // return res.status(401).send("Invalid username or password.");
                        return res.redirect("/public/login.html?status=invalid");
                    }
                    const accessToken = jwt.sign(
                        { userId: user._id },
                        process.env.JWT_SECRET,
                        { expiresIn: "1h" }
                    );

                    const refreshToken = jwt.sign(
                        { userId: user._id },
                        process.env.JWT_SECRET,
                        { expiresIn: "24h" }
                    );

                    res.cookie("accessToken", accessToken, {
                        httpOnly: true,
                        maxAge: 60 * 60 * 1000
                    });

                    res.cookie("refreshToken", refreshToken, {
                        httpOnly: true,
                        maxAge: 24 * 60 * 60 * 1000
                    });

                    // res.send("Login Succesful")
                    return res.redirect("/dashboard");
                })
        })
        .catch((error) => {
            console.log(error);
            // res.status(500).send("Login failed. Please try again");
             return res.redirect("/public/login.html?status=failed");
        })

};
const refreshAccesToken = (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) {
        return res.status(401).send("Plesase login again");
    }
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) {
            return res.status(401).send("Refresh token expired");
        }
        const accessToken = jwt.sign(
            { userId: decoded.userId },
            process.env.JWT_SECRET,
            { expiresIn: "1h" })
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000
        });
        // res.send("Acess token refreshed successfully");
        return res.redirect("/dashboard");
    })
};
const logout = (req, res) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    // res.send("Logged out successfully.");
    res.redirect("/public/index.html");
};
const forgotPassword = (req, res) => {
    const email = req.body.email;
    Verification.findOne({
        email: email,
        isVerified: true
    })
        .then((verification) => {
            if (!verification) {
                // return res.send(
                //     "If this email is registered, a password reset link will be sent."
                // );
                return res.redirect("/public/forgot-password.html?status=sent");
            }
            return User.findOne({ email: verification.email })
                .then((user) => {
                    if (!user) {
                        return res.send(
                            "If this email is registered, a password reset link will be sent."
                        );
                    }
                    const resetToken = crypto.randomBytes(32).toString("hex");
                    verification.resetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
                    verification.resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
                    return verification.save()
                        .then(() => {
                            const resetLink =
                                `http://localhost:${port}/public/reset-password.html?token=${resetToken}`;

                            return transporter.sendMail({
                                from: process.env.EMAIL_USER,
                                to: verification.email,
                                subject: "Reset Your Password",
                                html: `
                                <h2>Password Reset</h2>
                                <p>Click the link below to reset your password.</p>
                                <a href="${resetLink}">Reset Password</a>
                                <p>This link expires in 15 minutes.</p>
                            `
                            });
                        })
                        .then(() => {
                            // return res.send(
                            //     "If this email is registered, a password reset link will be sent."
                            // );
                            return res.redirect("/public/forgot-password.html?status=sent");
                        });
                });
        })
        .catch((error) => {
            console.log("Forgot password error:", error);
            return res.status(500).send("Unable to process your request.");
        });
};
const resetPassword = (req, res) => {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    Verification.findOne({
        resetToken: hashedToken,
        resetTokenExpiresAt: { $gt: new Date() }
    })        .then((verification) => {
            if (!verification) {
                return res.status(400).send(
                    "Reset link is invalid or expired."
                );
            }
            return User.findOne({ email: verification.email })
                .then((user) => {
                    if (!user) {
                        return res.status(404).send("User not found.");
                    }

                    return bcrypt.hash(password, 10)
                        .then((hashedPassword) => {
                            user.password = hashedPassword;
                            return user.save();
                        })
                        .then(() => {
                            verification.resetToken = null;
                            verification.resetTokenExpiresAt = null;
                            return verification.save();
                        })
                        .then(() => {
                            res.clearCookie("signupToken");
                            return res.redirect("/public/login.html");
                        });
                });
        })
        .catch((error) => {
            console.log("Reset password error:", error);
            return res.status(500).send("Unable to reset password.");
        });
};
const changePassword = (req, res) => {
    const { currentPassword, newPassword } = req.body;
    User.findById(req.user.userId)
        .select("+password")
        .then((user) => {
            if (!user) {
                return res.status(404).send("User not found.");
            }
            return bcrypt.compare(currentPassword, user.password)
                .then((isMatch) => {
                    if (!isMatch) {
                        return res.status(400).send(
                            "Current password is incorrect."
                        );
                    }
                    return bcrypt.hash(newPassword, 10)
                        .then((hashedPassword) => {
                            user.password = hashedPassword;
                            return user.save();
                        })
                        .then(() => {
                            // return res.send(
                            //     "Password changed successfully."
                            // );
                            return res.redirect("/profile");
                        });
                });
        })
        .catch((error) => {
            console.log("Change password error:", error);
            return res.status(500).send(
                "Unable to change password."
            );
        });
};
module.exports = {
    sendVerification,
    verifyEmail,
    completeSignup,
    login,
    refreshAccesToken,
    logout,
    forgotPassword,
    resetPassword,
    changePassword
};
