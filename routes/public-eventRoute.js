const express = require("express");
const publicEventRouter = express.Router();
const Event = require("../models/Event"); // Adjust the path as necessary

publicEventRouter.get("/events/public-event", async (req, res) => {
  try {
    const events = await Event.find({ public_event: true });
    res.json(events);
  } catch (err) {
    console.error("Error fetching events:", err); // Debugging line
    res.status(500).json({ error: "Internal Server Error" });
  }
});

publicEventRouter.get("/events/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json(event);
  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = publicEventRouter;
