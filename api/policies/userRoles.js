/**
 * userRoles
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
	req.session.userRoles = [];
		restService.select(
			'Login',
		{
			"SessionId":sails.config.appSession,
			"currentState":'login',
			"method":'getuserroles'
		},
		function(error,response) {
			return parserService.parse(error,response,
				function(err){
					logService.debug(err);
					return next();
				},
				function(result){
					req.session.userRoles = result.Rows;
					return next();
				}
			);
		}
	);

};
