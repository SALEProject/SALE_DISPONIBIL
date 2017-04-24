/**
 * assetWarrantyTypes
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */ 
module.exports = function(req, res, next) {
	req.session.assetWarrantyTypes = [];
	var assetId = null;
	assetId = req.param('asset')*1;
	if(assetId) {
		restService.select(
			'Asset',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getAssetWarrantyTypes',
				"objects":[
					{
						"Arguments":{
							"ID_Asset": assetId
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
						req.session.assetWarrantyTypes = result.Rows;
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
