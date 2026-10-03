const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Auth Header:", authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {

      return res.status(401).json({
        success: false,
        message: "Authorization token missing or invalid",
      });
    }

    const token = authHeader.split(" ")[1];

    //  FIX: variable name consistent rakho
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);



    //   req.user structure
    req.user = {
      _id: decodedToken.id || decodedToken._id || decodedToken.userId,
    };

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
