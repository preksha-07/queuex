
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");

async function testMyQueue() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOne();

    if (!user) {
      console.log("No registered user found.");
      return;
    }

    const response = await fetch(
      `http://localhost:5000/api/queue/my?userId=${user._id}`
    );

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("My queue:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Test failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testMyQueue();
