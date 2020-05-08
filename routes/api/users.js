//For register and login user
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

//@route    Post api/users
//@desc     Register route
//@access   Public
router.post(
  '/',
  [
    check('name', 'Name is required.').not().isEmpty(),
    check('email', 'Please include valid Email.').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters.'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //Destructure from req.body
    const { name, email, password } = req.body;

    try {
      //See if user exits
      let user = await User.findOne({ email });

      if (user) {
        res.status(400).json({ errors: [{ msg: 'User already exists.' }] });
      }

      //Get user gravatar
      const avatar = gravatar.url(email, {
        s: '200', //Size
        r: 'pg', // Not naked
        d: 'mm', // Gives you default image if you do not have gravatar
      });

      user = new User({ name, email, avatar, password });

      //Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

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

      //console.log(req.body); // that's the object of data that's going to send this route
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//@route    Get api/users/test
//@desc     Test route
//@access   Public
router.get('/test', (req, res) => res.send('User routes'));

module.exports = router;
