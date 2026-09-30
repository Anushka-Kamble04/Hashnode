const express = require("express");

const { getTags,getPostsByTag } = require("../controllers/tagController");

const router = express.Router();

router.get("/", getTags);
router.get("/:slug/posts", getPostsByTag);


module.exports = router;