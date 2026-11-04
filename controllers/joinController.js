
import Event from "../models/Event.js";
import Join from "../models/Join.js";

// Join an event
export const joinEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await Event.findOne({
      _id: id,
      date: { $gt: new Date() },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Upcoming event not found",
      });
    }

    const joined = await Join.create({
      eventId: event._id,
      eventTitle: event.title,
      userId: req.user.id,
      userEmail: req.user.email,
    });

    return res.status(201).json({
      success: true,
      message: "You have successfully joined this event!",
      joined,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already joined this event",
      });
    }

    console.error("Join Event Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to join event",
    });
  }
};

// Check whether user has joined an event
export const checkJoinedEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const joined = await Join.findOne({
      eventId: id,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      hasJoined: Boolean(joined),
    });
  } catch (error) {
    console.error("Check Joined Event Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check joined status",
    });
  }
};

// Get all events joined by the logged-in user
export const getJoinedEvents = async (req, res) => {
  try {
    const joinedEvents = await Join.find({
      userId: req.user.id,
    })
      .populate("eventId")
      .sort({ createdAt: -1 });

    const events = joinedEvents
      .filter((join) => join.eventId)
      .map((join) => ({
        ...join.eventId.toObject(),
        joinedAt: join.createdAt,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Get Joined Events Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch joined events",
    });
  }
};
