//For addinf post, comments and like posts
//For register and login user

const express = require('express');
const router = express.Router();

//@route    Get api/posts
//@desc     Test route
//@access   Public

router.get('/', (req, res) => res.send('Post routes'));
module.exports = router;
