const express = require("express");
const { markAttendance } = require("../controllers/attendeeController");

const router = express.Router();

router.post("/mark", markAttendance);

//feedback route

   

module.exports = router;
