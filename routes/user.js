const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AuthMiddleware = require("../middleware/AuthMiddleware");


const userRouter = express.Router();


userRouter.post("/signup", async (req, res) => {
  const { email, password, role, name } = req.body;
  if (!["attendee", "organizer", "guest"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, role, name });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
});


userRouter.post("/signin", async (req, res) => {
    const email = req.body.email;
    const password= req.body.password;

  if (!email || !password) {
    return res.status(400).json({ msg: "Email and password are required" });
  }

  try {
    const userEx = await User.findOne({ email });
    if (!userEx) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    
    const compass = await userEx.comparePass(password);
    if (!compass) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }

    const token = userEx.generateToken();
    return res.status(200).json({
      msg: "User logged in successfully",
      token,
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

userRouter.route("/user").get(AuthMiddleware, async (req, res) => {
  try {
    const userData = await req.user;
    console.log(userData);
    return res.status(200).json({ userData });
  } catch (error) {
    console.log(`error from server ${error}`);
  }
});

module.exports = userRouter;
