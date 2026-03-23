import "dotenv/config";
import jwt from "jsonwebtoken";

const ENV = process.env.ENVIRONMENT;

const verifyAccessToken = (req, res, next) => {
  if (ENV === "dev") {
    next();
    return;
  }

  const authHeader = req?.headers["authorization"];

  if (!authHeader) {
    res
      .status(401)
      .send({ message: "'authorization' header not found, unauthorised!" });

    return;
  }

  //[0]    [1]
  //Bearer token...
  const token = authHeader.split(" ")[1]; //Extract token from header

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    { algorithms: ["HS256"] },
    (err) => {
      if (err) {
        return res.status(403).send("Verify token failed: Invalid token");
      }

      next();
    }
  );
};

export { verifyAccessToken };
