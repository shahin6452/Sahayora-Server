
import Event from "../models/Event.js";
import Join from "../models/Join.js";

const getAvatar = (nameOrEmail) =>
  `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(
    nameOrEmail || "Sahayora"
  )}`;

// Create Event
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

    const creatorName =
      req.user.name?.trim() || req.user.email.split("@")[0];

    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      type: type.trim(),
      image: image.trim(),
      location: location.trim(),
      date: eventDate,
      creatorId: req.user.id,
      creatorName,
      creatorImage: req.user.image || getAvatar(creatorName),
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

// Get All Upcoming Events
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

    return res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Get Upcoming Events Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming events",
    });
  }
};

// Get Event Details with Organizer and Volunteers
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(id).lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const joins = await Join.find({ eventId: id })
      .select("userId userName userImage userEmail")
      .sort({ createdAt: 1 })
      .lean();

    const organizerName =
      event.creatorName || event.creatorEmail?.split("@")[0] || "Organizer";

    const organizer = {
      id: event.creatorId || "",
      name: organizerName,
      email: event.creatorEmail,
      image: event.creatorImage || getAvatar(organizerName),
    };

    const volunteers = joins.map((join) => {
      const name =
        join.userName || join.userEmail?.split("@")[0] || "Volunteer";

      return {
        id: join.userId,
        name,
        image: join.userImage || getAvatar(name),
      };
    });

    return res.status(200).json({
      success: true,
      event,
      organizer,
      volunteerCount: volunteers.length,
      volunteers,
    });
  } catch (error) {
    console.error("Get Event By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch event details",
    });
  }
};

// Get Events Created by Logged-in User
export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({
      creatorEmail: req.user.email,
    }).sort({ date: 1 });

    return res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Get My Events Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your events",
    });
  }
};

// Update Own Event
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, image, location, date } = req.body;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

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

    const event = await Event.findOneAndUpdate(
      {
        _id: id,
        creatorEmail: req.user.email,
      },
      {
        title: title.trim(),
        description: description.trim(),
        type: type.trim(),
        image: image.trim(),
        location: location.trim(),
        date: eventDate,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you are not the owner",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event updated successfully!",
      event,
    });
  } catch (error) {
    console.error("Update Event Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update event",
    });
  }
};

// Delete Own Event
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await Event.findOneAndDelete({
      _id: id,
      creatorEmail: req.user.email,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you are not the owner",
      });
    }

    // Remove volunteer records when an event is deleted
    await Join.deleteMany({ eventId: id });

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully!",
    });
  } catch (error) {
    console.error("Delete Event Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete event",
    });
  }
};
