const Event = require("../models/Event");
const Attendee = require("../models/Attendees");

const markAttendance = async (req, res) => {
  const { token, latitude, longitude } = req.body;

  try {
    // Find attendee by token
    const attendee = await Attendee.findOne({ token });
    if (!attendee) return res.status(400).json({ message: "Invalid token." });

    // Check if attendance is already marked
    if (attendee.isPresent) {
      return res.status(400).json({ message: "Attendance has already been marked." });
    }

    // Find event by attendee's eventId
    const event = await Event.findById(attendee.eventId);
    if (!event) return res.status(400).json({ message: "Event not found." });

    // Extract event date and time
    const currentDate = new Date().toISOString().split("T")[0];
    const eventDate = new Date(event.start_date).toISOString().split("T")[0];

    const currentTime = new Date();
    const currentHours = currentTime.getHours().toString().padStart(2, "0"); // "HH"
    const currentMinutes = currentTime.getMinutes().toString().padStart(2, "0"); // "MM"
    const formattedCurrentTime = `${currentHours}:${currentMinutes}`;

    // Compute 1 hour grace period after event end time
    const [eventEndHour, eventEndMinute] = event.end_time.split(":").map(Number);
    const endTimeDate = new Date();
    endTimeDate.setHours(eventEndHour + 1, eventEndMinute, 0, 0); // 1 hour grace period
    const oneHourLater = endTimeDate.toTimeString().slice(0, 5); // Format "HH:MM"

    // Ensure attendance is marked on the same day and within valid time range
    if (currentDate !== eventDate || formattedCurrentTime < event.end_time || formattedCurrentTime > oneHourLater) {
      return res.status(400).json({ message: "Attendance can only be marked during or within 1 hour after the event." });
    }

    console.log("Date and time verified");

    // Validate location
    const distance = calculateDistance(
      event.venue.latitude,
      event.venue.longitude,
      latitude,
      longitude
    );

    if (distance > 100) {
      return res.status(400).json({ message: "You must be at the event location to mark attendance." });
    }

    console.log("Location verified");

    // Update attendance status
    attendee.isPresent = true;
    await attendee.save();

    res.json({ message: "Attendance marked successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Function to calculate distance (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

module.exports = { markAttendance };