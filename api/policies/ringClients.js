/**
 * ringClients
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
	req.session.ringClients = [];
	var ringId = null;
	if(req.options.action=='asset_clients') {
		var asset = req.session.asset;
		if(asset) {
			ringId = asset.ID_Ring;
		}
	}
	else {
		ringId = req.param('id')*1;
	}
	if(ringId) {
		restService.select(
			'Ring',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getRingClients',
				"objects":[
					{
						"Arguments":{
							"ID_Ring": ringId
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
						req.session.ringClients = result.Rows;
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
