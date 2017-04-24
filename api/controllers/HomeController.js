module.exports = {

	index: function (req, res) {
		var moment = require('moment');
		if(req.isSocket) {
			return res.json({time:new moment()});
		}
		return res.view({title:'Disponibil.ro',time:new moment()});
	},

	subscribe: function (req, res) {
		if(req.isSocket) {
			User.publishCreate({id:Date.now()});
			Order.watch(req.socket);
			OrderMatch.watch(req.socket);
			Alert.watch(req.socket);
			Chat.watch(req.socket);
			Transaction.watch(req.socket);
			Ring.watch(req.socket);
			RingSession.watch(req.socket);
			Asset.watch(req.socket);
			AssetSession.watch(req.socket);
			//DeltaT.watch(req.socket);
			DeltaT1.watch(req.socket);
			DeltaTBroker.subscribe(req,req.session.currentUser.ID);
			DeltaT1Broker.subscribe(req,req.session.currentUser.ID);
			Translation.watch(req.socket);
			Journal.watch(req.socket);
			User.watch(req.socket);
			UserLogin.subscribe(req,req.session.currentUser.ID);
			UserLogin.publishDestroy(req.session.currentUser.ID,req.socket);
			//UserLogin.watch(req.socket);
			//sails.storage.sessions.push({id: req.socket.id, user: sails.storage.users[sessionService.getSessionID(req)]});
			return res.json({Success:true, ResultType:'string', Result: 'Successfully registered socket'});
		}
		else return res.json({Success:false, ResultType:'GeneralError', Result: 'Wrong connection type'});
	},

	time: function (req, res) {
		restService.select(
			'RingSession',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'servertime',
				"useResource":false
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						if(typeof err == 'string') return res.json({Success:false, ResultType:'GeneralError', Result: err});
						else return res.json(err);
					},
					function(result){
						return res.json({Success:true, ResultType:'String', Result: result});
					}
				);
			}
		);
	},

	measuringunits: function (req, res) {
		restService.select(
			'Nomenclator',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getMeasuringUnits',
				"objects":[
					{
						"Arguments": {
							"ID_Market": sails.config.marketId
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						if(typeof err == 'string') return res.json({Success:false, ResultType:'GeneralError', Result: err});
						else return res.json(err);
					},
					function(result){
						return res.json({Success:true, ResultType:'String', Result: result.Rows});
					}
				);
			}
		);
	},

	currencies: function (req, res) {
		restService.select(
			'Nomenclator',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getCurrencies',
				"objects":[
					{
						"Arguments": {
							"ID_Market": sails.config.marketId
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						if(typeof err == 'string') return res.json({Success:false, ResultType:'GeneralError', Result: err});
						else return res.json(err);
					},
					function(result){
						return res.json({Success:true, ResultType:'Array', Result: result.Rows});
					}
				);
			}
		);
	},

	clients: function (req, res) {
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
						if(typeof err == 'string') return res.json({Success:false, ResultType:'GeneralError', Result: err});
						else return res.json(err);
					},
					function(result){
						return res.json({Success:true, ResultType:'String', Result: result.Rows});
					}
				);
			}
		);
	},

	journal: function (req, res) {
		var moment = require('moment');
		var currentUser = req.param('user')?req.param('user')*1:null;
		var currentAgency = req.param('agency')?req.param('agency')*1:null;
		var startDate = req.param('startdate')?req.param('startdate'):new moment().format('YYYY-MM-DD');
		var arguments = {};
		if(currentUser) arguments.ID_User = currentUser;
		if(currentAgency) arguments.ID_Agency = currentAgency;
		arguments.Since = startDate;
		restService.select(
			'Journal',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getJournal',
				"objects":
				[
					{
						"Arguments": arguments
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						if(typeof err == 'string') return res.json({Success:false, ResultType:'GeneralError', Result: err});
						else return res.json(err);
					},
					function(result){
						return res.json({Success:true, ResultType:'Array', Result: result.Rows});
					}
				);
			}
		);
	},

  agencies: function (req, res) {
		restService.select(
			'Agency',
      {
        "SessionId":sails.config.appSession,
        "currentState":'dashboard',
        "method":'select',
        "procedure":'getAgencies',
        "objects":
          [
            {
              "Arguments":
              {
                "SortField":'AgencyName',
                "SortOrder":'asc',
                "QueryKeyword":req.param('term') ? req.param('term') :null,
                "QueryOffset":0,
                "QueryLimit":10
              }
            }
          ]
      },
      function(error,response) {
        return parserService.parse(error,response,
          function(err){
            logService.debug(err);
            return res.send(500);
          },
          function(result){
            var items = [];
            result.Rows.forEach(function (item) {
              items.push({
                id: item.ID,
                label: item.AgencyName
              });
            });
            return res.json(items);
          }
        );
      }
    );
  },

  users: function (req, res) {
		restService.select(
			'Login',
      {
        "SessionId":sails.config.appSession,
        "currentState":'login',
        "method":'getusers',
        "objects":[
          {
            "Arguments":{
              "SortField":'FirstName',
              "SortOrder":'asc',
              "QueryKeyword":req.param('term') ? req.param('term') :null,
              "QueryOffset":0,
              "QueryLimit":10
            }
          }
        ]
      },
      function(error,response) {
        return parserService.parse(error,response,
          function(err){
            if(typeof err == 'string') return res.json({Success:false, ResultType:'GeneralError', Result: err});
            else return res.json(err);
          },
          function(result){
            var items = [];
            result.Rows.forEach(function (item) {
              items.push({
                id: item.ID,
                label: item.LoginName + ' (' + item.FirstName + ' ' + item.LastName + ')'
              });
            });
            return res.json(items);
          }
        );
      }
    );
  }
};
