import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: token not found" });
        }

        const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = verifyToken.userId;

        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Unauthorized: invalid token" });
    }
};

export default isAuth;
