const jsonwebtoken = require("jsonwebtoken");
const { NotAuthorizedError } = require("../helpers/errors");
const { User } = require("../database/userModel");

const authMiddleware = async (req, res, next) => {
  try {
    if (!req.headers["authorization"])
      next(
        new NotAuthorizedError(
          "Please, provide a token in request authorization header"
        )
      );

    const [_, token] = req.headers["authorization"].split(" ");

    if (!token || !jsonwebtoken.decode(token, process.env.SECRET_KEY))
      next(new NotAuthorizedError("Please, provide a token"));

    const user = jsonwebtoken.decode(token, process.env.SECRET_KEY);
    const foundUser = await User.findById(user._id);

    if (!foundUser) next(new NotAuthorizedError("Not authorized"));

    if (token !== foundUser.token)
      next(new NotAuthorizedError("Not authorized"));
    req.token = token;
    req.user = foundUser;
    next();
  } catch (error) {
    next(new NotAuthorizedError("Not authorized"));
  }
};

module.exports = { authMiddleware };