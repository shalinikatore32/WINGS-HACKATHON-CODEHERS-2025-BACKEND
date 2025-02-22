const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const Papa = require("papaparse");
const Event = require("../models/Event");
const Attendee = require("../models/Attendees");
const crypto = require("crypto");
const mongoose = require('mongoose');

// Ensure "uploads" directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, "uploaded_image" + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Email Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Event Routes
// router.post("/event", async (req, res) => {
//   const event = req.body;
//   const newevent = new Event(event);
//   await newevent.save();
//   res.json({ message: "Event created successfully" });
// });

// router.get("/event", async (req, res) => {
//   const events = await Event.find();
//   res.json(events);
// });

// // Attendee Routes
// router.get("/attendees", async (req, res) => {
//   try {
//     const attendees = await Attendee.find();
//     res.json(attendees);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching attendees", error: err });
//   }
// });

// router.post("/attendees", async (req, res) => {
//   const { name, phoneNumber, email } = req.body;
//   const newAttendee = new Attendee({ name, phoneNumber, email });
//   try {
//     await newAttendee.save();
//     res.json(newAttendee);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// Upload Image
router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "⚠️ No image uploaded." });
  }

  res.json({
    message: "✅ Image uploaded successfully!",
    filePath: req.file.path,
  });
});

// Send Email
router.post("/send-email", async (req, res) => {
  try {
    const attendees = await Attendee.find({}, "email");
    const emails = attendees
      .map((attendee) => attendee.email)
      .filter((email) => email);

    if (emails.length === 0) {
      return res
        .status(400)
        .json({ message: "⚠️ No emails found in the database." });
    }

    const imagePath = "uploads/uploaded_image.jpg";
    if (!fs.existsSync(imagePath)) {
      return res.status(400).json({
        message: "⚠️ No image uploaded. Please upload an image first.",
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emails.join(","),
      subject: "📢 Important Announcement with Image",
      text: "Please find the attached image.",
      attachments: [{ filename: "uploaded_image.jpg", path: imagePath }],
    };

    const info = await transporter.sendMail(mailOptions);
    res.json({ message: "✅ Emails sent successfully!", info });
  } catch (err) {
    res.status(500).json({ message: "Error sending email", error: err });
  }
});

// Upload CSV and Save Data
router.post("/uploads", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  const filePath = path.join(__dirname, req.file.path);
  const file = fs.readFileSync(filePath, "utf-8");

  Papa.parse(file, {
    header: true,
    complete: async (result) => {
      try {
        const attendees = result.data.map((item) => ({
          name: item.name,
          phoneNumber: item.phoneNumber,
          email: item.email,
        }));

        await Attendee.insertMany(attendees);
        fs.unlinkSync(filePath);
        res.status(200).send("Attendees uploaded successfully!");
      } catch (error) {
        res.status(500).send("Error saving attendees");
      }
    },
  });
});

// Get Attendees for a Specific Event
router.get("/events/:eventId/attendees", async (req, res) => {
  try {
    const attendees = await Attendee.find({ eventId: req.params.eventId });
    res.json(attendees);
  } catch (err) {
    res.status(500).json({ message: "Error fetching attendees", error: err });
  }
});

// Add Attendee to an Event
router.post('/events/:eventId/attendees', async (req, res) => {
  const { eventId } = req.params;
  const { name, phoneNumber, email } = req.body;

  try {
    // Validate input
    if (!name || !phoneNumber || !email) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate eventId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    // Generate a unique token using crypto
    const token = crypto.randomBytes(20).toString('hex');

    // Create a new attendee
    const newAttendee = new Attendee({
      name,
      phoneNumber,
      email,
      eventId,
      token,
    });

    // Save the attendee to the database
    await newAttendee.save();

    // Update the event's attendees array
    await Event.findByIdAndUpdate(
      eventId,
      { $push: { attendees: newAttendee._id } },
      { new: true, useFindAndModify: false }
    );

    res.status(201).json(newAttendee);
  } catch (error) {
    console.error('Error adding attendee:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
