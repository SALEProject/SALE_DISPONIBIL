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
	req.session.agencies = {};
	if(accessService.isSupervisor(req.session.currentUser) || accessService.isSessionCoordonator(req.session.currentUser) || req.session.currentUser.isAdministrator) {
		restService.select(
			'Agency',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getAgenciesShort',
				"objects":
					[
						{
							"Arguments":
							{
								"SortField": "Name",
								"SortOrder": "asc",
								"ID_Agency": req.param('agency') ? req.param('agency')*1 : -1
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
						//req.session.agencies = toolsService.sortArray(result.Rows,'AgencyName');
						for(var i=0;i<result.Rows.length;i++) {
							req.session.agencies[result.Rows[i].ID] = result.Rows[i];
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
