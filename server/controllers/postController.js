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

const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }
//Ownership check
    if (!req.user._id.equals(post.author)) {
  return res.status(403).json({
    message: "You are not allowed to update this post",
  });
}

const { title, content, tags, coverImage, status } = req.body;
//validate status
if (status && !["draft", "published"].includes(status)) {
  return res.status(400).json({
    message: "Status must be either draft or published",
  });
}
//validate tags
if (tags && !Array.isArray(tags)) {
  return res.status(400).json({
    message: "Tags must be an array",
  });
}
//If new title is provided and it's different from the current title, generate a new slug
if (title && title !== post.title) {
  const baseSlug = generateSlug(title);

  let slug = baseSlug;
  let counter = 2;

  while (
    await Post.findOne({
      slug,
      _id: { $ne: post._id },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  post.slug = slug;
}
//Update fields if provided
if (title) {
  post.title = title;
}

if (content) {
  post.content = content;
  post.excerpt = generateExcerpt(content);
}

if (coverImage !== undefined) {
  post.coverImage = coverImage;
}

if (status) {
  post.status = status;
}
//Handle tags 
if (tags) {
  const tagIds = [];

  for (const tagName of tags) {
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

  post.tags = tagIds;
}
//Save the updated post
await post.save();

return res.status(200).json({
  message: "Post updated successfully",
  post,
});
  } catch (error) {
    console.error("Update post error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // ownership check
    if (!req.user._id.equals(post.author)) {
  return res.status(403).json({
    message: "You are not allowed to delete this post",
  });
}
await post.deleteOne();

return res.status(200).json({
  message: "Post deleted successfully",
});

} catch (error) {
    console.error("Delete post error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      author: req.user._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      posts,
    });
  } catch (error) {
    console.error("Get my posts error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = { createPost, getPublishedPosts, getPostBySlug, updatePost, deletePost, getMyPosts };