/**
 * users
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
	req.session.users = [];
	if(accessService.isSupervisor(req.session.currentUser) || accessService.isSessionCoordonator(req.session.currentUser) || req.session.currentUser.isAdministrator) {
		restService.select(
			'Login',
			{
				"SessionId":sails.config.appSession,
				"currentState":'login',
				"method":'getusers'
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						logService.debug('policy users: ' + err);
						return next();
					},
					function(result){
						req.session.users = result.Rows;
						return next();
					}
				);
			}
		);
	}
	else {
		return next();
	}

};
