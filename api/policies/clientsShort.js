/**
 * agencies
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
	req.session.clientsShort = {};
		restService.select(
			'Client',
		{
			"SessionId":sessionService.getSessionID(req),
			"currentState":'login',
			"method":'select',
			"procedure":'getClientsShort',
			"objects": [
				{
					"Arguments": {
						"Status": "active"
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
					for(var i=0;i<result.Rows.length;i++) {
						req.session.clientsShort[result.Rows[i].ID] = result.Rows[i];
					}
					return next();
				}
			);
		}
	);
};
