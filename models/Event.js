
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
    },

    type: {
      type: String,
      required: [true, "Event type is required"],
      trim: true,
    },

    image: {
      type: String,
      required: [true, "Event image URL is required"],
      trim: true,
    },

    location: {
      type: String,
      required: [true, "Event location is required"],
      trim: true,
    },

    date: {
      type: Date,
      required: [true, "Event date is required"],
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "Event date must be in the future",
      },
    },

    creatorEmail: {
      type: String,
      required: [true, "Creator email is required"],
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
