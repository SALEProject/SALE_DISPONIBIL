module.exports = function(req, res, next) {
	req.session.agencyBrokers = [];
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
						"ID_Agency":req.param('id')*1,
						"isBroker":true
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
					req.session.agencyBrokers = result.Rows;
					return next();
				}
			);
		}
	);
};
