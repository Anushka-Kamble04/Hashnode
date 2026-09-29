const Post = require("../models/Post");
const Tag = require("../models/Tag");
const generateSlug = require("../utils/generateSlug");
const generateExcerpt = require("../utils/generateExcerpt");

const createPost = async (req, res) => {
  try {
    const { title, content, tags, coverImage, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    if (tags && !Array.isArray(tags)) {
      return res.status(400).json({
        message: "Tags must be an array",
      });
    }

    const postStatus = status || "draft";

    if (!["draft", "published"].includes(postStatus)) {
      return res.status(400).json({
        message: "Status must be either draft or published",
      });
    }

    const baseSlug = generateSlug(title);

    let slug = baseSlug;
    let counter = 2;

    while (await Post.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const excerpt = generateExcerpt(content);

    const tagIds = [];

    for (const tagName of tags || []) {
      const normalizedName = tagName.trim().toLowerCase();

      if (!normalizedName) {
        continue;
      }

      const tagSlug = generateSlug(normalizedName);

      let tag = await Tag.findOne({
        name: normalizedName,
      });

      if (!tag) {
        tag = await Tag.create({
          name: normalizedName,
          slug: tagSlug,
        });
      }

      tagIds.push(tag._id);
    }

    const post = await Post.create({
      title,
      slug,
      content,
      excerpt,
      coverImage,
      status: postStatus,
      author: req.user._id,
      tags: tagIds,
    });

    return res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Create post error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getPublishedPosts = async (req, res) => {
  try {
   const search = req.query.search;
   const tag = req.query.tag;

let tagId;

if (tag) {
  const existingTag = await Tag.findOne({
    name: tag.trim().toLowerCase(),
  });

  if (!existingTag) {
    return res.status(200).json({
      posts: [],
    });
  }

  tagId = existingTag._id;
}

const query = {
  status: "published",
};

if (search) {
  query.title = {
    $regex: search,
    $options: "i",
  };
}

if (tagId) {
  query.tags = tagId;
}

const posts = await Post.find(query).sort({
  createdAt: -1,
});
    return res.status(200).json({
      posts,
    });
  } catch (error) {
    console.error("Get posts error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getPostBySlug = async (req, res) => {
  try {
    const post = await Post.findOne({
      slug: req.params.slug,
      status: "published",
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    return res.status(200).json({
      post,
    });
  } catch (error) {
    console.error("Get post error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};



module.exports = { createPost, getPublishedPosts, getPostBySlug };