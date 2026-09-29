const express = require("express");

const { createPost, getPublishedPosts, getPostBySlug } = require("../controllers/postController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createPost);
router.get("/", getPublishedPosts);
router.get("/:slug", getPostBySlug);

module.exports = router;