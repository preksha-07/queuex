
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const Service = require("./models/Service");
const QueueEntry = require("./models/QueueEntry");

const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOne();
    const service = await Service.findOne({ name: "Doctor Consultation" });

    if (!user || !service) {
      console.log("User or service not found. Run the earlier tests first.");
      return;
    }

    let entry = await QueueEntry.findOne({
      user: user._id,
      service: service._id,
      status: { $in: ["WAITING", "CALLED"] },
      queueDate: new Date().toLocaleDateString("en-CA"),
    });

    if (!entry) {
      const response = await fetch(
        `http://localhost:5000/api/queue/join/${service._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user._id.toString() }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.log("Could not create a queue entry:", data);
        return;
      }

      entry = data.entry;
    }

    const response = await fetch(
      `http://localhost:5000/api/queue/${entry._id}/cancel`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id.toString() }),
      }
    );

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Response:", data);

    if (response.ok && data.entry.status === "CANCELLED") {
      console.log("SUCCESS: Queue cancellation works!");
    } else {
      console.log("Cancellation test failed.");
    }
  } catch (error) {
    console.error("Test error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

runTest();
