const jwt = require("jsonwebtoken");
const User = require("../models/user");

function adminMiddleware(req, res, next) {
    const token = req.cookies.accessToken;
    if (!token) {
        return res.status(401)
        // .send("Please log in first.");   
        }
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error || !decoded || !decoded.userId) {
            return res.status(401)
            // .send("Invalid or expired access token.");
        }
        User.findById(decoded.userId)
            .then((user) => {
                if (!user) {
                    return res.status(401)
                    // .send("User account not found.");
                }
                if (user.role !== "admin") {
                    return res.status(403)
                    // .send("Access denied.");
                }
                req.user = { userId: String(user._id), role: user.role };
                next();
            })
            .catch((error) => {
                console.error("Admin authorization error:", error);
                res.status(500)
            // . send("Unable to verify admin permission.");
            });
    });
}

module.exports = adminMiddleware;
