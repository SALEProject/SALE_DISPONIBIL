/**
 * measuringUnits
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

  if (noCache || diff >= 30 || true) {
    sails.storage.adminStaticDataCacheTime = now;
    noCache = false;

    sails.storage.measuringUnits = [];
		restService.select(
			'Nomenclator',
      {
        "SessionId": sessionService.getSessionID(req),
        "currentState": 'login',
        "method": 'select',
        "procedure": 'getMeasuringUnits'
      },
      function (error, response) {
        return parserService.parse(error, response,
          function (err) {
            logService.debug(err);
            return next();
          },
          function (result) {
            sails.storage.measuringUnits = toolsService.sortTranslatedArray(result.Rows, 'Name', req);
            return next();
          }
        );
      }
    );
  } else {
    return next();
  }
};
