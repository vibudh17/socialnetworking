// which will handle getting JSON web token for authentication
//For register and login user

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const auth = require('../../middleware/authMiddleware');
const User = require('../../models/User');

//@route    Get api/auth
//@desc     Test route
//@access   Public

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route    Post api/auth
//@desc     Login route
//@access   Public
router.post(
  '/',
  [
    check('email', 'Please include valid Email.').isEmail(),
    check('password', 'Password is required.').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //Destructure from req.body
    const { email, password } = req.body;

    try {
      //See if user exits
      let user = await User.findOne({ email });

      if (!user) {
        res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      //Return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        config.get('jwtToken'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
