
import mongoose from "mongoose";

const joinSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    eventTitle: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

joinSchema.index({ eventId: 1, userId: 1 }, { unique: true });

const Join = mongoose.model("Join", joinSchema);

export default Join;
