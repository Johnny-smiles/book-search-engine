const jwt = require('jsonwebtoken');

// set token secret and expiration date
const secret = 'secret1234';
const expiration = '1h';

module.exports = {
  authMiddleware: function ({ req }) {
    // tokens
    let token = req.body.token || req.query.token || req.headers.authorization;

    // 
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    if (!token) {
      return req;
    }

    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.log('Invalid token');
    }

    return req;
  },

  // confirming token
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
