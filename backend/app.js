const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require('cors');

const errorMiddleware = require("./middleware/error");

// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "backend/config/config.env" });
}

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure CORS once with your desired options
const corsOptions = {
  origin: '*', // Replace with the allowed origin or origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies and authentication headers to be sent
  optionsSuccessStatus: 204, // Respond with a 204 status for preflight requests
};

app.use(cors(corsOptions));

// Route Imports
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const camera = require("./routes/cameraRoute");

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", camera);

app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
});

// Middleware for Errors
app.use(errorMiddleware);

module.exports = app;
