/**
 * isAdministrator
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
	req.session.ring = null;
		restService.select(
			'RingSession',
		{
			"SessionId":req.sessionID,
			"currentState":'login',
			"method":'select',
			"procedure":'getTradingSessionStats'
		},
		function(error,result) {
		// Error handling
		  if (error) {
			console.log('BUUUUU:'+error);
			return next();

		  // The Book was found successfully!
		  } else {
			toolsService.parseResponse(result,function(msg) {
				console.log('success but failed:'+msg);
				return next();
			},
			function(resultObject) {
				//console.log(resultObject.Rows);
				//console.log('ring stats:'+resultObject.Rows[0]);
				req.session.ring = resultObject.Rows[0];
				return next();
			});
		  }
	});

};
