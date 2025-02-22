const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  ticket_type: {
    type: String,
    required: true,
    enum: ["VIP", "General Admission"], // Add more types as needed
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  sold: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Ticket", ticketSchema);
