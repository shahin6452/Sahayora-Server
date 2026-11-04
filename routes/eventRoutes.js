
import express from "express";

import {
  createEvent,
  getUpcomingEvents,
  getEventById,
  getMyEvents,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";

import {
  joinEvent,
  checkJoinedEvent,
  getJoinedEvents,
} from "../controllers/joinController.js";

import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

// Get all upcoming events
router.get("/", getUpcomingEvents);

// Create a new event
router.post("/", requireAuth, createEvent);

// Get events created by logged-in user
router.get("/my-events", requireAuth, getMyEvents);

// Get events joined by logged-in user
router.get("/joined", requireAuth, getJoinedEvents);

// Join an event
router.post("/:id/join", requireAuth, joinEvent);

// Check joined status
router.get("/:id/join-status", requireAuth, checkJoinedEvent);

// Update own event
router.put("/:id", requireAuth, updateEvent);

// Delete own event
router.delete("/:id", requireAuth, deleteEvent);

// Get event details
router.get("/:id", getEventById);

export default router;
