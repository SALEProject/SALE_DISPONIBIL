/**
 * asset_types
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

    sails.storage.assetTypes = [];
		restService.select(
			'AssetType',
      {
        "SessionId": sessionService.getSessionID(req),
        "currentState": 'login',
        "method": 'select',
        "procedure": 'getAssetTypes',
        "objects": [
          {
            "Arguments": {
              "ID_Market": sails.marketId
            }
          }
        ]
      },
      function (error, response) {
        return parserService.parse(error, response,
          function (err) {
            logService.debug(err);
            return next();
          },
          function (result) {
            sails.storage.assetTypes = toolsService.sortTranslatedArray(result.Rows, 'Name', req);
            return next();
          }
        );
      }
    );
  } else {
    return next();
  }
};
