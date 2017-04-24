/**
 * rings
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
  var ua = req.headers['user-agent'],
    regEx = /MSIE\s[1-8]/g;

  if (regEx.test(ua)) {
    return res.redirect('/browser');
  }

  return next();
};
