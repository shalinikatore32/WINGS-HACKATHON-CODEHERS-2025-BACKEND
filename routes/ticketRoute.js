const express = require("express");
const ticketRouter = express.Router();
const Ticket = require("../models/TicketModel");
const Event = require("../models/Event");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Purchase = require("../models/PurchaseModel");



ticketRouter.get("/users/:userId/events/:eventId/purchases", async (req, res) => {
  try {
    const { userId, eventId } = req.params;
    const purchases = await Purchase.find({ userId, eventId }).populate('ticketId');

    if (!purchases || purchases.length === 0) {
      return res.status(404).json({ message: "No purchases found for this event" });
    }

    res.status(200).json(purchases);
  } catch (error) {
    console.error("Error fetching purchases:", error);
    res.status(500).json({ message: error.message });
  }
});

// Route to create tickets for an event
ticketRouter.post("/events/:eventId/tickets", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { ticket_type, price, quantity } = req.body;

    console.log("Received ticket data:", req.body);

    // Ensure the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Create a new ticket
    const ticket = new Ticket({
      event: eventId,
      ticket_type,
      price,
      quantity,
    });

    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ message: error.message });
  }
});

// Ensure this route is defined in your ticketRouter
ticketRouter.get("/events/:eventId/tickets", async (req, res) => {
  try {
    const { eventId } = req.params;
    const tickets = await Ticket.find({ event: eventId });

    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ message: error.message });
  }
});

ticketRouter.get("/events/:eventId/tickets/:ticketId", async (req, res) => {
  try {
    const { eventId, ticketId } = req.params;
    const ticket = await Ticket.findOne({ _id: ticketId, event: eventId });
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(200).json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ message: error.message });
  }
});

ticketRouter.post(
  "/events/:eventId/tickets/:ticketId/create-payment-intent",
  async (req, res) => {
    try {
      const { ticketId } = req.params;
      const { quantity } = req.body;

      const ticket = await Ticket.findById(ticketId);

      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      if (ticket.sold + quantity > ticket.quantity) {
        return res
          .status(400)
          .json({ message: "Not enough tickets available" });
      }

      const amount = ticket.price * quantity * 100; // Amount in cents

      const paymentIntent = await stripe.paymentIntents.create({
  amount,
  currency: "usd",
  payment_method_types: ["card"],
});

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = ticketRouter;
