const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
    try {

        console.log("at authorization");

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Authorization token missing or invalid',
                success: false
            });
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
        
       req.user = { userId: decodedToken.id }; 
       
        next(); 
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: 'Invalid or expired token',
            success: false
        });
    }
};
