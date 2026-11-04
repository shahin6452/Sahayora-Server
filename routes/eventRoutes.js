
import express from "express";

import {
  getUpcomingEvents,
  getEventById,
} from "../controllers/eventController.js";

const router = express.Router();

// GET /api/events
router.get("/", getUpcomingEvents);

// GET /api/events/:id
router.get("/:id", getEventById);

export default router;
