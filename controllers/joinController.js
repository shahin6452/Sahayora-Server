
import Event from "../models/Event.js";
import Join from "../models/Join.js";

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
