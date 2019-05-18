const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const auth = require("../../middleware/auth");

const Post = require("../../model/Post");
const User = require("../../model/User");
const Profile = require("../../model/Profile");

/**
 * @route       POST api/posts
 * @description Create a post
 * @access      Private
 */

router.post(
  "/",
  [
    auth,
    [
      check("text", "Text is Required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      const post = await newPost.save();

      res.json(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

/**
 * @route       GET api/posts
 * @description Get a posts
 * @access      Private
 */

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });

    await res.status(200).json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error!");
  }
});

/**
 * @route       GET api/posts/:id
 * @description Get a post by Id
 * @access      Private
 */

router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).sort({ date: -1 });

    if (!post) return res.status(404).json({ msg: "Post not found." });

    await res.status(200).json(post);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error!");
  }
});

module.exports = router;
