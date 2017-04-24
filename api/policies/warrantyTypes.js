/**
 * warranty type
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
	req.session.warrantyTypes = [];
		restService.select(
			'Warranty',
		{
			"SessionId":sessionService.getSessionID(req),
			"currentState":'login',
			"method":'select',
			"procedure":'getWarrantyTypes'
		},
		function(error,response) {
			return parserService.parse(error,response,
				function(err){
					logService.debug(err);
					return next();
				},
				function(result){
					req.session.warrantyTypes = result.Rows;
					return next();
				}
			);
		}
	);
};
