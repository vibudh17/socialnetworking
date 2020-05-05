// which will handle getting JSON web token for authentication
//For register and login user

const express = require('express');
const router = express.Router();

//@route    Get api/auth
//@desc     Test route
//@access   Public

router.get('/', (req, res) => res.send('Auth routes'));
module.exports = router;
