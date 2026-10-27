
const baseUrl = "http://localhost:5000/api/auth";

async function testAuth() {
  const email = `test${Date.now()}@example.com`;
  const password = "test123456";

  try {
    console.log("Testing registration...");

    const registerResponse = await fetch(`${baseUrl}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email,
        password,
      }),
    });

    const registerData = await registerResponse.json();

    console.log("Registration status:", registerResponse.status);
    console.log("Registration response:", registerData);

    if (!registerResponse.ok) return;

    console.log("\nTesting login...");

    const loginResponse = await fetch(`${baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const loginData = await loginResponse.json();

    console.log("Login status:", loginResponse.status);
    console.log("Login response:", loginData);

    if (loginResponse.ok) {
      console.log("\nSUCCESS! Registration and login both work!");
    }
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

testAuth();
