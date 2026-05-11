const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas підключено"))
  .catch((err) => console.log("Помилка MongoDB:", err));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "utility_monitor_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI
    })
  })
);

const authRoutes = require("./routes/auth");
const readingRoutes = require("./routes/readings");

app.use("/api/auth", authRoutes);
app.use("/api/readings", readingRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Сервер запущено: http://localhost:${PORT}`);
});