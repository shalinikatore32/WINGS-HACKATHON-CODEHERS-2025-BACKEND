const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  venue: {
    name: { type: String, required: true }, // Venue name
    location: {
      type: { type: String, default: "Point" }, // GeoJSON type
      coordinates: {
        type: [Number], // Array of numbers: [longitude, latitude]
        required: true,
      },
    },
  },
  event_type: {
    type: String,
    required: true,
    enum: ["conference", "concert", "wedding", "birthday"],
  },
  public_event: { type: Boolean, default: false },
  image: { type: String },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  attendees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendee",
    },
  ],
});

// Create a 2dsphere index on the location field for geospatial queries
eventSchema.index({ "venue.location": "2dsphere" });

module.exports = mongoose.model("Event", eventSchema);