
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));

app.use("/api/services", require("./routes/services"));

app.use("/api/queue", require("./routes/queue"));

app.use("/api/admin", require("./routes/admin"));

app.get("/", (req, res) => {
  res.json({ message: "QUEUEX backend is running!" });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`QUEUEX server running on port ${PORT}`);
  });
};

startServer();