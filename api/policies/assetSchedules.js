/**
 * assetClients
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
	req.session.assetSchedules = [];
		restService.select(
			'Ring',
		{
			"SessionId":sessionService.getSessionID(req),
			"currentState":'login',
			"method":'select',
			"procedure":'getAssetsSchedules',
			"objects":[{
				"Arguments":{
					"ID_Market":sails.marketId,
					"ID_Asset":req.param('ID_Asset')*1
				}
			}]
		},
		function(error,response) {
			return parserService.parse(error,response,
				function(err){
					logService.debug(err);
					return next();
				},
				function(result){
					req.session.assetSchedules = result.Rows;
					return next();
				}
			);
		}
	);
};
