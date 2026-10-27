
const mongoose = require("mongoose");
require("dotenv").config();

const Service = require("./models/Service");
const QueueEntry = require("./models/QueueEntry");

async function testProvider() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const service = await Service.findOne({
      name: "Doctor Consultation",
    });

    if (!service) {
      console.log("Service not found.");
      return;
    }

    // Find a person who has already been called
    const entry = await QueueEntry.findOne({
      service: service._id,
      status: "CALLED",
    }).sort({ tokenNumber: 1 });

    if (!entry) {
      console.log(
        "No CALLED entry found. Run the call-next test first."
      );
      return;
    }

    console.log("Queue entry ID:", entry._id.toString());
    console.log("Marking entry as served...");

    const response = await fetch(
      `http://localhost:5000/api/queue/${entry._id}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SERVED" }),
      }
    );

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("\nSUCCESS! The person has been marked as served.");
    }
  } catch (error) {
    console.error("Test failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testProvider();
