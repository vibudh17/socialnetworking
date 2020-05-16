//For profile adding, fetching, updating and deleting
//For register and login user

const express = require('express');
const router = express.Router();
const auth = require('../../middleware/authMiddleware');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const config = require('config');
const request = require('request');

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
      check('skills', 'Skills are required').not().isEmpty(),
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

// @route    GET api/profile
// @desc     Delete Profile, User and Post
// @access   Private
router.delete('/', auth, async (req, res) => {
  try {
    //--@todo Remove User post

    //Remove Profile
    await Profile.findOneAndDelete({ user: req.user.id });
    //Remove User
    await User.findOneAndDelete({ _id: req.user.id });
    return res.status(200).json({ msg: 'User Deleted' });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// @route    Put api/profile/experience
// @desc     Add experience in profile
// @access   Private

router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required.').not().isEmpty(),
      check('company', 'Company is required.').not().isEmpty(),
      check('from', 'From date is required.').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { title, company, location, from, to, current } = req.body;
    const newExp = { title, company, location, from, to, current };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({ msg: 'Server error' });
    }
  }
);

// @route    Delete api/profile/experience/:exp_id
// @desc     Delete experience in Profile
// @access   Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    return res.json(profile);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json('Server Error');
  }
});

// @route    Put api/profile/education
// @desc     Add education in profile
// @access   Private

router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School name is required.').not().isEmpty(),
      check('degree', 'Degree is required.').not().isEmpty(),
      check('fieldofstudy', 'Field of study date is required.').not().isEmpty(),
      check('from', 'From date is required.').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;
    const newEducation = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEducation);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({ msg: 'Server error' });
    }
  }
);

// @route    Delete api/profile/education/:edu_id
// @desc     Delete education in Profile
// @access   Private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);
    profile.education.splice(removeIndex, 1);
    await profile.save();
    return res.json(profile);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json('Server Error');
  }
});

// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public
router.get('/github/:username', async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubClientID'
      )}&client_secret=${config.get('githubClientSecret')}`,
      method: 'Get',
      headers: {
        'user-agent': 'node.js',
      },
    };
    request(options, (error, response, body) => {
      if (error) console.error(error);
      if (!response == 200) {
        res.status(500).send('No Github profile found.');
      }
      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    return res.status(404).json({ msg: 'No Github profile found' });
  }
});

module.exports = router;
