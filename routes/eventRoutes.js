
import express from "express";
import {
  createEvent,
  getUpcomingEvents,
  getEventById,
} from "../controllers/eventController.js";

import {
  joinEvent,
  checkJoinedEvent,
} from "../controllers/joinController.js";

import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

// Get all upcoming events
router.get("/", getUpcomingEvents);

// Create a new event
router.post("/", requireAuth, createEvent);

// Join an event
router.post("/:id/join", requireAuth, joinEvent);

// Check whether the logged-in user has joined an event
router.get("/:id/join-status", requireAuth, checkJoinedEvent);

// Get event details
router.get("/:id", getEventById);

export default router;
