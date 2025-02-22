const cron = require("node-cron");
const mongoose = require("mongoose");
const sendEmail = require("../utils/sendEmail");
const Event = require("../models/Event");
const Attendee = require("../models/Attendees");

function getFormattedDateForMongo() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
}

const todayFormatted = getFormattedDateForMongo();
console.log(`Today's Date: ${todayFormatted}`); // Example output: 2025-02-21T00:00:00.000Z

// Function to send attendance links 1 hour before event ends
const sendAttendanceLinks = async () => {
  try {
    const now = new Date(); // Get the current time
    const currentHours = now.getHours().toString().padStart(2, "0"); // "HH"
    const currentMinutes = now.getMinutes().toString().padStart(2, "0"); // "MM"
    const currentTime = `${currentHours}:${currentMinutes}`;

    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
    const oneHourLaterFormatted =
      oneHourLater.getHours().toString().padStart(2, "0") +
      ":" +
      oneHourLater.getMinutes().toString().padStart(2, "0");

    // Find events that will end in exactly 1 hour
    const events = await Event.find({
      start_date: todayFormatted,
      end_time: { $gte: currentTime, $lte: oneHourLaterFormatted },
    });

    if (events.length === 0) {
      console.log(`No events ending in the next hour. Current Time: ${currentTime}`);
      return;
    }

    console.log(`Found ${events.length} event(s) ending soon.`);

    for (const event of events) {
      console.log(`Processing event: ${event.title}`);

      // Find attendees for the event
      const attendees = await Attendee.find({ eventId: event._id });

      if (!attendees || attendees.length === 0) {
        console.log(`No attendees found for event: ${event.title}`);
        continue;
      }

      for (const attendee of attendees) {
        console.log(`Sending email to ${attendee.email}`);

        const link = `${process.env.FRONTEND_URL}/attendance?eventId=${event._id}&token=${attendee.token}`;

        const content = `<p>Hello ${attendee.name},</p>
          <p>You have been invited to the event "${event.title}". Please mark your attendance by clicking the link below during the event time:</p>
          <a href="${link}">${link}</a>`;

        await sendEmail(attendee.email, `Attendance for ${event.title}`, content);
        console.log(`Attendance email sent to ${attendee.email}`);
      }
    }
  } catch (error) {
    console.error("Error sending attendance links:", error);
  }
};

// Schedule the cron job to run every 15 minutes
cron.schedule("*/15 * * * *", sendAttendanceLinks, {
  scheduled: true,
  timezone: "Asia/Kolkata", // Adjust timezone if necessary
});

module.exports = { sendAttendanceLinks };
