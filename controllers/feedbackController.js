const Event = require("../models/Event");
const Attendee = require("../models/Attendees");

const submitFeedback = async (req, res) => {
  const { token, feedback } = req.body;

  try {
    // Find attendee by token
    const attendee = await Attendee.findOne({ token });
    if (!attendee) {
      return res.status(400).json({ message: "Attendee not registered for any event." });
    }

    // Fetch event using attendee's eventId
    const event = await Event.findById(attendee.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    // Ensure attendee has attended before submitting feedback
    if (!attendee.isPresent) {
      return res.status(403).json({ message: "Cannot submit feedback without attending the event." });
    }

    // Store feedback in Attendee model
    attendee.feedback = feedback;
    await attendee.save();

    res.json({ message: "Feedback submitted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

module.exports = { submitFeedback };
