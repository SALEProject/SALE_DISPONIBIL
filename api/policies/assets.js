 var sizeof = require('object-sizeof');
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
	req.session.assets = [];
	return next();
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
					console.log('total assets:'+result.Rows.length);
					req.session.assets = result.Rows;
					//console.log('assets size:'+sizeof(result.Rows));
					return next();
				}
			);
		}
	);

};
