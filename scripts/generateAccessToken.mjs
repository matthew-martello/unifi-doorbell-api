import "dotenv/config";
import jwt from "jsonwebtoken";

const secret = process.env.ACCESS_TOKEN_SECRET;

if (!secret) {
  console.error("ACCESS_TOKEN_SECRET is not set.");
  process.exit(1);
}

const payload = {
  sub: "doorbell-api-manual-client",
  scope: "doorbell:trigger",
};

const token = jwt.sign(payload, secret, {
  algorithm: "HS256",
});

console.log(token);
