
const Event = require("../models/Event");

// Get all upcoming events
const getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.find({
      date: { $gt: new Date() },
    })
      .sort({ date: 1 })
      .limit(6);

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming events",
    });
  }
};

// Get single event details
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch event details",
    });
  }
};

module.exports = {
  getUpcomingEvents,
  getEventById,
};
