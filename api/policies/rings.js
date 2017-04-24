/**
 * rings
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

var noCache = true;

module.exports = function(req, res, next) {
  if (!sails.storage.adminStaticDataCacheTime) {
    sails.storage.adminStaticDataCacheTime = new Date();
  }

  var now = new Date();
  var diff = new Date(now - sails.storage.adminStaticDataCacheTime).getSeconds();

  if (noCache || diff >= 10) {
    sails.storage.adminStaticDataCacheTime = now;
    noCache = false;

    sails.storage.rings = [];
		restService.select(
			'Ring',
      {
        "SessionId":sessionService.getSessionID(req),
        "currentState":'dashboard',
        "method":'select',
        "procedure":'getRings',
          "objects": [
            {
              "Arguments": {
                "ID_Market":sails.marketId,
                "anystatus":true,
                "all":true,
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
            //console.log('got rings '+result.Rows.length);
            //sails.storage.rings = toolsService.sortTranslatedArray(result.Rows,'Name',req);
            sails.storage.rings = result.Rows;
            return next();
          }
        );
      }
    );
  } else {
    return next();
  }
};
