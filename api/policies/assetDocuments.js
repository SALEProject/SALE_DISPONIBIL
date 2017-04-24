/**
 * Asset Documents
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
	req.session.assetDocuments = [];
		restService.select(
			'Document',
		{
			"SessionId":sessionService.getSessionID(req),
			"currentState":'login',
			"method":'select',
			"procedure":'getDocuments',
			"objects":[
				{
					"Arguments":{
						"ID_Asset":req.param('asset')*1,
						"all":true
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
					req.session.assetDocuments = result.Rows;
					return next();
				}
			);
		}
	);
};
