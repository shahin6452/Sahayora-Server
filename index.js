
import "dotenv/config";

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import eventRoutes from "./routes/eventRoutes.js";

import { auth } from "./auth.mjs";
import { toNodeHandler } from "better-auth/node";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

const startServer = async () => {
  try {
    await connectDB();

    // Better Auth routes
    app.all(/^\/api\/auth\/.*/, toNodeHandler(auth));

    app.use(express.json());

    // Health check
    app.get("/", (req, res) => {
      res.status(200).json({
        success: true,
        message: "Sahayora API is running!",
      });
    });

    // Event routes
    app.use("/api/events", eventRoutes);

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();