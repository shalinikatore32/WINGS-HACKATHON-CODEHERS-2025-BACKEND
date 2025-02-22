const mongoose = require("mongoose");

const attendeeSchema = new mongoose.Schema({
  name: String,
  phoneNumber: String,
  email: String,
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  token: { type: String, unique: true },
  isPresent: { type: Boolean, default: false },
  feedback:{type:String},
});

module.exports = mongoose.model("Attendee", attendeeSchema);
