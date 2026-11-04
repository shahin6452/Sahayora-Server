
const express = require("express");
const router = express.Router();

const {
  getUpcomingEvents,
  getEventById,
} = require("../controllers/eventController");

// GET /api/events
router.get("/", getUpcomingEvents);

// GET /api/events/:id
router.get("/:id", getEventById);

module.exports = router;
