
const mongoose = require("mongoose");

const queueEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    tokenNumber: {
      type: Number,
      required: true,
    },
    queueDate: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["WAITING", "CALLED", "SERVED", "CANCELLED"],
      default: "WAITING",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent duplicate token numbers for the same service and date
queueEntrySchema.index(
  { service: 1, queueDate: 1, tokenNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model("QueueEntry", queueEntrySchema);
