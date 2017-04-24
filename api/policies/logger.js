/**
 * logger
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
	//console.log('new request '+req.protocol+' '+req.url);
	logService.access(req.method+' '+req.protocol+' '+req.url+' '+sails.util.inspect(req.body));
	return next();
};
