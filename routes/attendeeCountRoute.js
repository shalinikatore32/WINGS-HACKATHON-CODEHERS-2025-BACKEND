const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const Attendee = require("../models/User");

router.get("/:organizerId/attendees", async (req, res) => {
  try {
    const { organizerId } = req.params;

    if (!organizerId) {
      return res.status(400).json({ message: "Organizer ID is required" });
    }

    // Fetch only private events organized by the given organizer
    const privateEvents = await Event.find({ organizer: organizerId, public_event: false });

    // Prepare an array to store event attendee counts
    const eventData = [];

    for (const event of privateEvents) {
      // Count only attendees who have `isPresent: true`
      const attendeeCount = await Attendee.countDocuments({ eventId: event._id, isPresent: true });

      eventData.push({
        eventName: event.title,
        attendeeCount,
      });
    }

    res.json(eventData);
  } catch (error) {
    console.error("Error fetching event attendees:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;