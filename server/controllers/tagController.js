const Tag = require("../models/Tag");
const Post = require("../models/Post");

const getTags = async (req, res) => {
  try {
    const tags = await Tag.find();

    const tagsWithCounts = await Promise.all(
      tags.map(async (tag) => {
        const postCount = await Post.countDocuments({
          tags: tag._id,
          status: "published",
        });

        return {
          name: tag.name,
          slug: tag.slug,
          postCount,
        };
      })
    );

    return res.status(200).json({
      tags: tagsWithCounts,
    });
  } catch (error) {
    console.error("Get tags error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getPostsByTag = async (req, res) => {
  try {
    const tag = await Tag.findOne({
      slug: req.params.slug,
    });

    if (!tag) {
      return res.status(404).json({
        message: "Tag not found",
      });
    }

    const posts = await Post.find({
  tags: tag._id,
  status: "published",
}).sort({
  createdAt: -1,
});
return res.status(200).json({
  tag: {
    name: tag.name,
    slug: tag.slug,
  },
  posts,
});

  } catch (error) {
    console.error("Get posts by tag error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = { getTags, getPostsByTag };