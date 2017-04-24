module.exports = function(req, res, next) {
	req.session.agencyContacts = [];
		restService.select(
			'Agency',
		{
			"SessionId":sessionService.getSessionID(req),
			"currentState":'login',
			"method":'select',
			"procedure":'getContacts',
			"objects":[
				{
					"Arguments":{
						"ID_Agency":req.param('id')*1
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
					req.session.agencyContacts = result.Rows;
					return next();
				}
			);
		}
	);
};
