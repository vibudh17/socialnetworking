//For profile adding, fetching, updating and deleting
//For register and login user

const express = require('express');
const router = express.Router();
const auth = require('../../middleware/authMiddleware');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');

//@route    Get api/profile/me
//@desc     Get logged in user profile
//@access   Private

router.get('/me', auth, async (req, res) => {
  try {
    //Get logged in profile
    //First user is ref user in Profile model
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      res.status(400).json({ msg: 'There is no profile for this user.' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      location,
      website,
      bio,
      skills,
      status,
      githubusername,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
    } = req.body;

    //Build Profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (githubusername) profileFields.githubusername = githubusername;
    if (status) profileFields.status = status;
    if (skills) {
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }

    //Build social object
    profileFields.social = {};

    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      //Find Profile
      let profile = await Profile.findOne({ user: req.user.id });

      //If found then update profile
      if (profile) {
        //Update Profile
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      //If not found then create profile
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    Get api/profile
// @desc     Get all profiles
// @access   Public

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.status(200).json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error.');
  }
});

// @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public
router.get('/user/:user_id', async (req, res) => {
  try {
    if (mongoose.Types.ObjectId.isValid(req.params.user_id)) {
      const profile = await Profile.findOne({
        user: req.params.user_id,
      }).populate('user', ['name', 'avatar']);
      console.log(profile);
      if (!profile) return res.status(400).json({ msg: 'Profile not found' });

      return res.json(profile);
    } else {
      return res.status(400).json({ msg: 'Invalid Profile ID.' });
    }
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    return res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
