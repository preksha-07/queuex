
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const Service = require("./models/Service");

async function testQueue() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOne();
    const service = await Service.findOne({
      name: "Doctor Consultation",
    });

    if (!user) {
      console.log("No user found. Register an account first.");
      return;
    }

    if (!service) {
      console.log("No service found. Create a service first.");
      return;
    }

    console.log("User ID:", user._id.toString());
    console.log("Service ID:", service._id.toString());

    const response = await fetch(
      `http://localhost:5000/api/queue/join/${service._id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id.toString(),
        }),
      }
    );

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Response:", data);

    if (response.ok) {
      console.log("\nSUCCESS! You joined the queue.");
    }
  } catch (error) {
    console.error("Test failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testQueue();


async function checkMyQueue() {
  try {
    const mongoose = require("mongoose");
    require("dotenv").config();

    await mongoose.connect(process.env.MONGO_URI);

    const User = require("./models/User");
    const user = await User.findOne();

    if (!user) {
      console.log("No registered user found.");
      return;
    }

    const response = await fetch(
      `http://localhost:5000/api/queue/my?userId=${user._id}`
    );

    console.log("Status:", response.status);
    console.log(
      "My queue:",
      JSON.stringify(await response.json(), null, 2)
    );
  } catch (error) {
    console.error("Queue lookup failed:", error.message);
  } finally {
    // This test shares a file with the join test.
    // The join test manages its own database connection.
  }
}
