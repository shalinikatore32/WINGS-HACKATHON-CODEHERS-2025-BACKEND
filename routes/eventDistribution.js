const express = require("express");
const { getEventAnalytics } = require("../controllers/eventDistribution");
const AuthMiddleware = require("../middleware/AuthMiddleware");

const router = express.Router();

router.get("/analytics/:id", AuthMiddleware, getEventAnalytics);

module.exports = router;