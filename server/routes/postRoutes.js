const express = require("express");

const { createPost, getPublishedPosts, getPostBySlug, updatePost, deletePost, getMyPosts } = require("../controllers/postController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createPost);
router.get("/", getPublishedPosts);
router.get("/mine", protect, getMyPosts);
router.get("/:slug", getPostBySlug);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);


module.exports = router;