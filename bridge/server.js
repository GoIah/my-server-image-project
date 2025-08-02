const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let latestData = null;

// Endpoint for JavaScript to send data
app.post("/js-to-server", (req, res) => {
  latestData = req.body;
  console.log("Received from JS:", latestData);
  res.sendStatus(200);
});

// Endpoint for Roblox to get data
app.get("/roblox-get-data", (req, res) => {
  res.json(latestData || {});
});

// Basic homepage
app.get("/", (req, res) => {
  res.send("Roblox Data Bridge is online");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
