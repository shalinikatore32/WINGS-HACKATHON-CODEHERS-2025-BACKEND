const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// Get count of events created per month
router.get("/:id/event-trends", async (req, res) => {
  try {
    const eventsPerMonth = await Event.aggregate([
      {
        $group: {
          _id: { $month: "$start_date" }, // Group by month (1 = Jan, 2 = Feb, etc.)
          count: { $sum: 1 }, // Count events in each month
        },
      },
      { $sort: { _id: 1 } }, // Sort by month
    ]);

    res.json(eventsPerMonth);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;