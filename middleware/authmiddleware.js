const jwt = require("jsonwebtoken");
const authMiddleware = (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) { return res.status(401).send("Please log in first."); }
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) {
            return res.status(401).send("Invalid or expired access token.");
        } req.user = decoded;
         next();
    });
}
module.exports = authMiddleware;