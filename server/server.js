require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const tagRoutes = require("./routes/tagRoutes");

const app = express();

connectDB();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/tags", tagRoutes);

app.get("/", (req, res) => {
  res.send("Hashnode API is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});