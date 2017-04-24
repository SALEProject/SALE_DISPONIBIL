var async = require('async');

module.exports = {

	change: function (req, res) {
		if(!req.param('ID_Ring')) {
      return res.json({Success:false, ResultType:'GeneralError', Result: 'missing parameter \'ID_Ring\''});
    }

    if(!req.param('ID_Asset')) {
      return res.json({Success:false, ResultType:'GeneralError', Result: 'missing parameter \'ID_Asset\''});
    }

    var apiResponse = {
      Success:true,
      ResultType:'Array',
      Result: {
        orderMatches: [],
        brokerClients: [],
        assetOrders: [],
        assetSession: []
      }
    };

    function loadMatches (callback) {
		restService.select(
			'Order',
        {
          "SessionId":sessionService.getSessionID(req),
          "currentState":'login',
          "method":'select',
          "procedure":'getOrderMatches',
          "objects":[
            {
              "Arguments":
              {
                "ID_Market": sails.config.marketId,
                "ID_Asset": req.param('ID_Asset')*1
              }
            }
          ]
        },
        function(error,response) {
          return parserService.parse(error,response,
            function(err){
              if(typeof err == 'string') return callback({Success:false, ResultType:'GeneralError', Result: err});
              else return callback(err);
            },
            function(result){
              apiResponse.Result.orderMatches = result.Rows;

              return callback();
            }
          );
        }
      );
    }

    function loadBrokerClients (callback) {
		restService.select(
			'Client',
        {
          "SessionId":sessionService.getSessionID(req),
          "currentState":'login',
          "method":'select',
          "procedure":'getBrokerClients',
          "objects":[
            {
              "Arguments": {
                "ID_Market": sails.config.marketId,
                "ID_Asset": req.param('ID_Asset')*1,
                "ID_Broker": req.session.currentUser.ID_Broker
              }
            }
          ]
        },
        function(error,response) {
          return parserService.parse(error,response,
            function(err){
              if(typeof err == 'string') return callback({Success:false, ResultType:'GeneralError', Result: err});
              else return callback(err);
            },
            function(result){
              apiResponse.Result.brokerClients = result.Rows;

              return callback();
            }
          );
        }
      );
    }

    function loadAssetOrders (callback) {
		restService.select(
			'Order',
        {
          "SessionId":sessionService.getSessionID(req),
          "currentState":'login',
          "method":'select',
          "procedure":'getOrders',
          "objects":[
            {
              "Arguments": {
                "ID_Market": sails.config.marketId,
                "ID_Ring": req.param('ID_Ring') ? req.param('ID_Ring')*1 : -1,
                "ID_Asset": req.param('ID_Asset') ? req.param('ID_Asset')*1 : -1,
                "all": true
              }
            }
          ]
        },
        function(error,response) {
          return parserService.parse(error,response,
            function(err){
              if(typeof err == 'string') return callback({Success:false, ResultType:'GeneralError', Result: err});
              else return callback(err);
            },
            function(result){
              for(var i=0;i<result.Rows.length;i++) {
                if(req.param('ID_Ring')!=null && req.param('ID_Asset')!=null && result.Rows[i].isActive || (!result.Rows[i].isActive && result.Rows[i].isSuspended)) {
                  if(sails.storage.assets[result.Rows[i].ID_Asset].AuctionType === 'simple' && result.Rows[i].ID_Broker==req.session.currentUser.ID_Broker || (result.Rows[i].ID_Agency==req.session.currentUser.ID_Agency && result.Rows[i].isInitial)) {
                    DeltaT.subscribe(req.socket,result.Rows[i].ID);
                    //DeltaT1.subscribe(req.socket,sails.storage.orders[i].ID);
                    //console.log('socket subscribed to delta');
                  }
                }
              }

              apiResponse.Result.assetOrders = result.Rows;

              return callback();
            }
          );
        }
      );
    }

    function loadAssetSession (callback) {
		restService.select(
			'RingSession',
        {
          "SessionId":sessionService.getSessionID(req),
          "currentState":'login',
          "method":'select',
          "procedure":'getTradingSessionStats',
          "objects": [
            {
              "Arguments": {
                "ID_Market": sails.marketId,
                "ID_Ring": req.param('ID_Ring')*1,
                "ID_Asset": req.param('ID_Asset')*1
              }
            }
          ]
        },
        function(error,response) {
          return parserService.parse(error,response,
            function(err){
              if(typeof err == 'string') return callback({Success:false, ResultType:'GeneralError', Result: err});
              else return callback(err);
            },
            function(result){
              for(var i=0;i<result.Rows.length;i++) {
                result.Rows[i].Name = req.session.getTranslation(result.Rows[i].Name);
              }

              apiResponse.Result.assetSession = result.Rows;

              return callback();
            }
          );
        }
      );
    }

    function final (err) {
      if (err) {
        return res.json(err);
      }

      return res.json(apiResponse);
    }

    var tasks = [loadMatches, loadBrokerClients, loadAssetOrders, loadAssetSession];

    async.parallel(tasks, final);
	}
};

