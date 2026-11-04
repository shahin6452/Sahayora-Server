
import { auth } from "../auth.mjs";
import { fromNodeHeaders } from "better-auth/node";

const requireAuth = async (req, res, next) => {
  try {
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
    console.error("Authentication Error:", error);

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

export default requireAuth;
