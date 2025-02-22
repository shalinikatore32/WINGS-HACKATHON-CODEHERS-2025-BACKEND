const jwt = require("jsonwebtoken");
const userD = require("../models/User");

const AuthMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");
  console.log(token);

  if (!token) {
    return res.status(401).json({ msg: "Unauthorized user" });
  }

  const jwtToken = token.replace("Bearer ", "");
  console.log("Token from auth middleware:", jwtToken);

  try {
    const isVerified = jwt.verify(jwtToken, process.env.SECRET_KEY);
    const userData = await userD
      .findOne({ email: isVerified.email })
      .select({ password: 0 });

    if (!userData) {
      return res.status(401).json({ msg: "Unauthorized user" });
    }

    req.user = userData;
    req.token = token;
    req.userId = userData._id;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = AuthMiddleware;
