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
	req.session.ringAssets = [];
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
							"ID_Ring": req.param('id')*1,
							"all":true,
							"anystatus": true,
							"SortField": "Name",
							"SortOrder": "asc"
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
					console.log('total ring assets:'+result.Rows.length);
					req.session.ringAssets = result.Rows;
					return next();
				}
			);
		}
	);

};
