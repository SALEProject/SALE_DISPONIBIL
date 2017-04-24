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
	req.session.userTransactions = null;
		restService.select(
			'Transaction',
		{
			"SessionId":req.sessionID,
			"currentState":'dashboard',
			"method":'select',
			"procedure":'getTransactions'
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
				req.session.userTransactions = resultObject.Rows;
				return next();
			});
		  }
	});

};
