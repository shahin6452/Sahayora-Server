import Event from "../models/Event.js";

export const getUpcomingEvents = async (req, res) => {
  try {
    let query = Event.find({ date: { $gt: new Date() } })
      .sort({ date: 1 });

    // Homepage চাইলে limit=6 পাঠাবে।
    const limit = Number.parseInt(req.query.limit, 10);

    if (Number.isInteger(limit) && limit > 0) {
      query = query.limit(Math.min(limit, 100));
    }

    const events = await query;

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Get Upcoming Events Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming events",
    });
  }
};

export const getEventById = async (req, res) => {
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