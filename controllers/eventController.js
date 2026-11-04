
import Event from "../models/Event.js";

export const createEvent = async (req, res) => {
  try {
    const { title, description, type, image, location, date } = req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !type?.trim() ||
      !image?.trim() ||
      !location?.trim() ||
      !date
    ) {
      return res.status(400).json({
        success: false,
        message: "All event fields are required",
      });
    }

    const eventDate = new Date(date);

    if (Number.isNaN(eventDate.getTime()) || eventDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid future date",
      });
    }

    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      type: type.trim(),
      image: image.trim(),
      location: location.trim(),
      date: eventDate,
      creatorEmail: req.user.email,
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully!",
      event,
    });
  } catch (error) {
    console.error("Create Event Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create event",
    });
  }
};

export const getUpcomingEvents = async (req, res) => {
  try {
    let query = Event.find({ date: { $gt: new Date() } }).sort({
      date: 1,
    });

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
    console.error("Get Event By ID Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch event details",
    });
  }
};
