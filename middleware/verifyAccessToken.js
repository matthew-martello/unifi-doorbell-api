import "dotenv/config";
import jwt from "jsonwebtoken";

const ENV = process.env.ENVIRONMENT;

function getClientIp(req) {
  const forwardedFor = req?.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }

  return req?.ip || req?.socket?.remoteAddress || "unknown";
}

function logFailedAuth(req, reason) {
  const timestamp = new Date().toISOString();
  const clientIp = getClientIp(req);

  console.error(`[${timestamp}] Failed auth from ${clientIp}: ${reason}`);
}

const verifyAccessToken = (req, res, next) => {
  if (ENV === "dev") {
    next();
    return;
  }

  const authHeader = req?.headers["authorization"];

  if (!authHeader) {
    logFailedAuth(req, "authorization header not found");

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
        logFailedAuth(req, "invalid token");
        return res.status(403).send("Verify token failed: Invalid token");
      }

      next();
    }
  );
};

export { verifyAccessToken };
