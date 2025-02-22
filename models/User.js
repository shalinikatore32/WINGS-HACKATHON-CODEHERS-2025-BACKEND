const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ["attendee", "organizer", "guest"],
  },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Method to compare passwords
userSchema.methods.comparePass = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Method to generate JWT token
userSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      userId: this._id.toString(),
      email: this.email,
      role: this.role,
    },
    process.env.SECRET_KEY,
    { expiresIn: "30d" }
  );
};

module.exports = mongoose.model("User", userSchema);
