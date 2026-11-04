
import { auth } from "../auth.mjs";
import { fromNodeHeaders } from "better-auth/node";
import { jwtVerify, createRemoteJWKSet } from "jose";

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.BETTER_AUTH_URL}/api/auth/jwks`)
);

const requireAuth = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    // JWT Bearer authentication
    if (authorization?.startsWith("Bearer ")) {
      const token = authorization.slice(7);

      const { payload } = await jwtVerify(token, JWKS, {
        issuer: process.env.BETTER_AUTH_URL,
        audience: process.env.BETTER_AUTH_URL,
      });

      if (!payload.sub) {
        return res.status(401).json({
          success: false,
          message: "Invalid authentication token",
        });
      }

      req.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
      };

      return next();
    }

    // Existing Better Auth session authentication
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    req.user = session.user;
    next();
  } catch (error) {
    console.error("Authentication Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

export default requireAuth;
