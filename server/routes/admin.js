
const express = require("express");
const User = require("../models/User");
const { protect, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// GET all users (admin only)
router.get("/users", protect, authorizeRoles("ADMIN"), async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.json(users);
  } catch (error) {
    console.error("Get admin users error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch users",
    });
  }
});

module.exports = router;
