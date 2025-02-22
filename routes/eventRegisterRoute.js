const express = require("express");
const eventRegisterRoute = express.Router();
const EventRegistration = require("../models/EventRegistration");
const Event = require("../models/Event");
const User = require("../models/User");
const AuthMiddleware = require("../middleware/AuthMiddleware");

// POST /events/:eventId/register
eventRegisterRoute.post(
  "/events/:eventId/register",
  AuthMiddleware,
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const { name, email, phone, additionalInfo } = req.body;

      // Validate input
      if (!name || !email || !phone) {
        return res
          .status(400)
          .json({ msg: "Name, email, and phone are required" });
      }

      // Check if the event exists
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ msg: "Event not found" });
      }

      // Check if the user is already registered for this event
      const existingRegistration = await EventRegistration.findOne({
        event: eventId,
        user: req.userId,
      });
      if (existingRegistration) {
        return res
          .status(400)
          .json({ msg: "You are already registered for this event" });
      }

      // Create the new registration
      const newRegistration = new EventRegistration({
        event: eventId,
        user: req.userId,
        name,
        email,
        phone,
        additionalInfo,
      });

      await newRegistration.save();

      // Optionally, you might want to update the user's document to keep track of registered events
      await User.findByIdAndUpdate(req.userId, {
        $push: { registeredEvents: eventId },
      });

      res.status(201).json({
        msg: "Registration successful",
        registration: newRegistration,
      });
    } catch (error) {
      console.error("Error during event registration:", error);
      res.status(500).json({ msg: "Internal server error" });
    }
  }
);

// GET /events/:eventId/registration-status
eventRegisterRoute.get(
  "/events/:eventId/registration-status",
  AuthMiddleware,
  async (req, res) => {
    try {
      const { eventId } = req.params;

      // Check if the event exists
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ msg: "Event not found" });
      }

      // Check if the user is registered for this event
      const registration = await EventRegistration.findOne({
        event: eventId,
        user: req.userId,
      });

      res.json({ isRegistered: !!registration });
    } catch (error) {
      console.error("Error checking registration status:", error);
      res.status(500).json({ msg: "Internal server error" });
    }
  }
);

eventRegisterRoute.get(
  "/user/registered-events",
  AuthMiddleware,
  async (req, res) => {
    try {
      // Fetch all event registrations for the current user
      const registrations = await EventRegistration.find({
        user: req.userId,
      }).populate("event");

      // Extract full event details from the registrations
      const registeredEvents = registrations.map((registration) => registration.event);

      res.json(registeredEvents);
    } catch (error) {
      console.error("Error fetching registered events:", error);
      res.status(500).json({ msg: "Internal server error" });
    }
  }
);
module.exports = eventRegisterRoute;
