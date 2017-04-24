/**
 * ringWarrantyTypes
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
	req.session.ringWarrantyTypes = [];
	var ringId = 0;
	if((req.options.action=='asset_save') || (req.options.action=='trade_param')) {
		var asset = toolsService.getArrayItem(req.session.assets,req.param('asset')*1);
		if(asset) {
			ringId = asset.ID_Ring;
		}
	}
	else {
		ringId = req.param('id')*1;
	}
	if(ringId > 0) {
		restService.select(
			'Ring',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getRingWarrantyTypes',
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
						req.session.ringWarrantyTypes = result.Rows;
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
