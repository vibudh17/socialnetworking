//For profile adding, fetching, updating and deleting
//For register and login user

const express = require('express');
const router = express.Router();

//@route    Get api/profile
//@desc     Test route
//@access   Public

router.get('/', (req, res) => res.send('Profile routes'));
module.exports = router;
