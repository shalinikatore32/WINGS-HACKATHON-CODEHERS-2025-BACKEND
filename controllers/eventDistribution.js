const Event = require("../models/Event");

exports.getEventAnalytics = async (req, res) => {
  try {
    const { id } = req.params; // Fetch organizer ID from URL parameters

    if (!id) {
      return res.status(400).json({ message: "Bad Request: No organizer ID provided" });
    }

    // Count public and private events for the specific organizer
    const publicEvents = await Event.countDocuments({ organizer: id, public_event: true });
    const privateEvents = await Event.countDocuments({ organizer: id, public_event: false });

    res.json({
      public_events: publicEvents,
      private_events: privateEvents,
    });
  } catch (error) {
    console.error("Error in getEventAnalytics:", error);
    res.status(500).json({ message: "Server Error" });
  }
};