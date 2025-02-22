const mongoose = require("mongoose");

const eventRegister = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  additionalInfo: { type: String },
  registeredAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("EventRegistration", eventRegister);
