/**
 * assets
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
	req.session.asset = null;
	if(req.param('id')) {
		restService.select(
			'Ring',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getAssets',
				"objects":
					[
						{
							"Arguments":
							{
								"ID_Market": sails.marketId,
								"all":true,
								"anystatus": true,
								"ID_Asset": req.param('id')*1
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
						//req.session.assets = toolsService.sortTranslatedArray(result.Rows,'Name',req);
						if(result.Rows.length>0) {
							req.session.asset = result.Rows[0];
						}
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
