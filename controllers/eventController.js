const Event = require("../models/Event");
const Attendee = require("../models/Attendee");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

const createEvent = async (req, res) => {
  try {
    const { name, date, startTime, endTime, location, attendees } = req.body;

    const event = new Event({ name, date, startTime, endTime, location, attendees: [] });

    // Add attendees and send invitations
   for (const attendee of attendees) {
      const token = crypto.randomBytes(20).toString("hex"); // Generate unique token
      event.attendees.push({ ...attendee, token });

    }

    await event.save();

    res.status(201).json({ message: "Event created and invitations sent!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to create event.", error });
  }
};

module.exports = { createEvent };
