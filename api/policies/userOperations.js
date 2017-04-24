/**
 * userOperations
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

var cacheTime = new Date(),
  noCache = true;

module.exports = function(req, res, next) {
	req.session.allowed_operations = {};
	var total = req.session.allowed_states.length;
	var counter = 0;

	//return next();
	var sessionID = sessionService.getSessionID(req);
	if(req.session.allowed_states.length==0) {
		logService.debug('no allowed states');
		return next();
	}

  var now = new Date();
  var diff = new Date(now - cacheTime).getSeconds();

  if (noCache || diff >= 10) {
    cacheTime = now;
    noCache = false;

    for (var i = 0; i < req.session.allowed_states.length; i++) {
      checkOperations(req.session.allowed_states[i]);
    }
  } else {
    return next();
  }

	function checkOperations(state) {
		restService.select(
			'Login',
			{
				"SessionId":sessionID,
				"currentState":state,
				"method":'checkstateoperation',
				"objects":[
					{
						"CheckStateOperation": ''
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.session.allowed_operations[state] = [];
						logService.debug(err);
						return cb();
					},
					function(result){
						//console.log('operations:'+result);
						req.session.allowed_operations[state] = result;
						return cb();
					}
				);
			}
		);
	}

	function cb() {
		counter++;
		if(counter==total) {
      return next();
    }
	}
};

