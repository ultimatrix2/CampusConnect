const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Authorization token missing or invalid',
                success: false
            });
        }

        const token = authHeader.split(' ')[1];

        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        console.log('Decoded Token:', decodedToken.userID);
        
       // req.user = { userId: decodedToken.userID }; 
       

        next(); 
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired token',
            success: false
        });
    }
};
