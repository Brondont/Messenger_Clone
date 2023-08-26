const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  if (!req.get("Authorization")) {
    const error = new Error("Invalid token");
    error.statusCode = 401;
    throw error;
  }
  const token = req.get("Authorization").split(" ")[1];
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      const error = new Error("Authentication failed.");
      error.statusCode = 401;
      throw error;
    }

    req.userId = decodedToken.userId;
    req.username = decodedToken.username;
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      err.message = "Token has expired.";
    }
    err.statusCode = 401;
    return next(err);
  }
};
