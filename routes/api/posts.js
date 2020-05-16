//For addinf post, comments and like posts
//For register and login user

const express = require('express');
const router = express.Router();
const auth = require('../../middleware/authMiddleware');
const { check, validationResult } = require('express-validator');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');
const mongoose = require('mongoose');

//@route    Post api/post
//@desc     Add Post
//@access   Private
router.post(
  '/',
  [auth, [check('text', 'Text is required.').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error.');
    }
  }
);

//@route    Get api/posts
//@desc     Get all Post
//@access   Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error.');
  }
});

//@route    Get api/posts/:id
//@desc     Get Post By ID
//@access   Private
router.get('/:id', auth, async (req, res) => {
  try {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      const postByID = await Post.findById(req.params.id);
      if (!postByID) return res.status(400).json({ msg: 'Post not found.' });

      res.json(postByID);
    } else {
      return res.status(400).json({ msg: 'Post not found.' });
    }
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId')
      return res.status(400).json({ msg: 'Post not found.' });
    return res.status(500).send('Server Error.');
  }
});

//@route    Delete api/posts/:id
//@desc     Delete a Post
//@access   Private
router.delete('/:id', auth, async (req, res) => {
  try {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(400).json({ msg: 'Post not found.' });
      if (post.user.toString() !== req.user.id)
        return res.status(400).json({ msg: 'User not authorized.' });
      await post.remove();
      res.json({ msg: 'Post Removed' });
    } else {
      return res.status(400).json({ msg: 'Post not found.' });
    }
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId')
      return res.status(400).json({ msg: 'Post not found.' });
    return res.status(500).send('Server Error.');
  }
});

// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   Private

router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(400).json({ msg: 'Post not found.' });
    //Check if the post has already been liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    )
      return res.status(400).json({ msg: 'Post already liked.' });
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error.');
  }
});

// @route    PUT api/posts/unlike/:id
// @desc     Post unlike by user
// @access   Private

router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(400).json({ msg: 'Post not found.' });
    //Check if the post has already been liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    )
      return res.status(400).json({ msg: 'Post has not been liked.' });
    //Get remove index
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error.');
  }
});

module.exports = router;
