import jwt, { Secret, SignOptions, TokenExpiredError } from "jsonwebtoken";

const generateToken = (payload: any, secret: Secret, expiresIn: string) => {
  const token = jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn: "1h",
  } as SignOptions);
  return token;
};

export const jwtHelper = {
  generateToken,
};
