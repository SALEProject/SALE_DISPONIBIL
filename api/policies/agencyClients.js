/**
 * agencyClients
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
	req.session.agencyClients = [];
		restService.select(
			'Agency',
		{
			"SessionId":sessionService.getSessionID(req),
			"currentState":'login',
			"method":'select',
			"procedure":'getAgencyClients',
			"objects":[
				{
					"Arguments":{
						"ID_Agency":req.param('id')*1
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
					req.session.agencyClients = result.Rows;
					return next();
				}
			);
		}
	);
};
