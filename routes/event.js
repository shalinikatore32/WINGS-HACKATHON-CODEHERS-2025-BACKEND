const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinaryConfig");
const Event = require("../models/Event");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const AuthMiddleware = require("../middleware/AuthMiddleware");

const eventRouter = express.Router();

// Configure Multer to use Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "events",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });

eventRouter.post(
  "/create-event",
  AuthMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      console.log("Request body:", req.body);
      console.log("Uploaded file:", req.file);
      console.log("Authenticated user ID:", req.userId);

      const {
        title,
        description,
        start_date,
        end_date,
        start_time,
        end_time,
        venueName,
        longitude,
        latitude,
        event_type,
        chief_guest,
        public_event,
      } = req.body;
      const image = req.file ? req.file.path : null;

      if (
        !title ||
        !description ||
        !start_date ||
        !end_date ||
        !start_time ||
        !end_time ||
        !venueName ||
        longitude === undefined ||
        latitude === undefined ||
        !event_type
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const event = new Event({
        title,
        description,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        start_time,
        end_time,
        venue: {
          name: venueName,
          location: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
        },
        event_type,
        chief_guest,
        public_event: public_event === "true", // Convert string to boolean
        image,
        organizer: req.userId,
      });

      await event.save();
      res.status(201).json({ message: "Event created successfully", event });
    } catch (error) {
      console.error("Error creating event:", error);
      res
        .status(500)
        .json({ message: "Event creation failed", error: error.message });
    }
  }
);

// Fetching all events
eventRouter.get("/events", async (req, res) => {
  try {
    const events = await Event.find().limit(3);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events" });
  }
});

eventRouter.get("/events/all", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events" });
  }
});

eventRouter.get("/my-events", AuthMiddleware, async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.userId });

    const categorizedEvents = {
      live: [],
      upcoming: [],
      past: [],
    };

    const currentDate = new Date();
    events.forEach((event) => {
      if (event.start_date <= currentDate && event.end_date >= currentDate) {
        categorizedEvents.live.push(event);
      } else if (event.start_date > currentDate) {
        categorizedEvents.upcoming.push(event);
      } else {
        categorizedEvents.past.push(event);
      }
    });

    res.status(200).json(categorizedEvents);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch events", error: error.message });
  }
});

// Endpoint to fetch a single event by ID
eventRouter.get("/events/:id", AuthMiddleware, async (req, res) => {
  try {
    console.log("Fetching event with ID:", req.params.id); // Debugging line
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error("Error fetching event:", error); // Debugging line
    res
      .status(500)
      .json({ message: "Failed to fetch event", error: error.message });
  }
});

// Endpoint to update an event by ID
eventRouter.put("/events/edit/:id", AuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Updating event with ID:", id); // Debugging line
    console.log("Request body:", req.body); // Debugging line

    const updatedEvent = await Event.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res
      .status(200)
      .json({ message: "Event updated successfully", event: updatedEvent });
  } catch (error) {
    console.error("Error updating event:", error); // Debugging line
    res
      .status(500)
      .json({ message: "Failed to update event", error: error.message });
  }
});
module.exports = eventRouter;