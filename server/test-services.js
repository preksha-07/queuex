
async function testServices() {
  try {
    console.log("Creating a test service...");

    const response = await fetch("http://localhost:5000/api/services", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Doctor Consultation",
        description: "General doctor consultation queue",
        averageServiceTime: 10,
      }),
    });

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Response:", data);

    if (response.ok) {
      console.log("\nNow fetching all services...");

      const listResponse = await fetch(
        "http://localhost:5000/api/services"
      );

      const services = await listResponse.json();

      console.log("Available services:", services);
      console.log("\nSUCCESS! Service creation works!");
    }
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

testServices();
