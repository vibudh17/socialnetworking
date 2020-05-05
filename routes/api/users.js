//For register and login user

const express = require('express');
const router = express.Router();

//@route    Get api/users
//@desc     Test route
//@access   Public

router.get('/', (req, res) => res.send('User routes'));
module.exports = router;
