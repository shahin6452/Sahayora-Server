
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const eventRoutes = require("./routes/eventRoutes");

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

    // Load Better Auth using dynamic imports
    const { auth } = await import("./auth.mjs");
    const { toNodeHandler } = await import("better-auth/node");

    // Better Auth routes must come before express.json()
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
