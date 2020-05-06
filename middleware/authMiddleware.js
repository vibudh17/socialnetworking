const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  //Get token from Header
  const token = req.header('x-auth-token'); //We need to send it x-auth-token in header

  //Check if not token
  if (!token)
    return res.status(401).json({ msg: 'No Token. Authorization Denied!' }); //401 unauthorized

  try {
    //Decode Token
    const decode = jwt.verify(token, config.get('jwtToken'));
    req.user = decode.user; //We can use req.user in any our protected routes
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token is not valid.' });
  }
};
