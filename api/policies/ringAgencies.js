/**
 * ringAgencies
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
	req.session.ringAgencies = [];
		restService.select(
			'Ring',
		{
			"SessionId":sessionService.getSessionID(req),
			"currentState":'login',
			"method":'select',
			"procedure":'getRingAgencies',
			"objects":[
				{
					"Arguments":{
						"ID_Ring":req.param('id')*1
					}
				}
			]
		},
		function(error,response) {
			return parserService.parse(error,response,
				function(err){
					logService.debug(err);
					return next();
				},
				function(result){
					req.session.ringAgencies = result.Rows;
					return next();
				}
			);
		}
	);
};
