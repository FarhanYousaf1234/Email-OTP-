const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = "YOUR_PRIVATE_KEY";
const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.header("Authorization");
        if (!token) {
            return res.status(401).send({ message: "Unauthorized. Please provide a valid token." });
        }
        jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).send({ message: "Unauthorized. Invalid token." });
            }
            req.user = decoded;
            next();
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};
module.exports = isAuthenticated;