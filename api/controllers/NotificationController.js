module.exports = {
    
	index: function (req, res) {
		if(!req.isSocket) return res.json({Success:false, ResultType:'GeneralError', Result: 'Wrong connection type'});
		restService.select(
			'Alert',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getNotifications',
				"objects": [
					{
						"Arguments": {
							"Since": (req.param('since') ? req.param('since') : '2014-01-01 00:00' )
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
						return res.json({Success:true, ResultType:'Array', Result:result.Rows});
					}
				);
			}
		);
	},


	readnotification: function (req, res) {
		if(req.method!=='POST') return res.json({Success:false, ResultType:'GeneralError', Result:'bad request method'});
		if(!req.param('id')) return res.json({Success:false, ResultType:'GeneralError', Result:'missing param id'});
		restService.select(
			'Alert',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"service":"/BRMWrite.svc",
				"procedure":'setNotificationRead',
				"objects": [
					{
						"Arguments": {
							"ID_Notification": req.param('id')*1
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
						return res.json({Success:true, ResultType:'Array', Result:[]});
					}
				);
			}
		);
	},

	alerts: function (req, res) {
		var items = [];
		var item = null;
		if(typeof sails.storage.alerts != 'undefined' && typeof sails.storage.alerts.Items != 'undefined') {
			items = [];
			//console.log(req.session.lang.code);
			for(var i in sails.storage.alerts.Items) {
				if(typeof sails.storage.alerts.Items[i]['Message_'+req.session.lang.code] != 'undefined') {
						var item = sails.storage.alerts.Items[i];
						item.Message = sails.storage.alerts.Items[i]['Message_'+req.session.lang.code];
						items.push(item);
					//console.log(items[i]['Message_'+req.session.lang.code]);
				}
			}
		//	console.log(items);
		}
		console.log('sending alerts');
		return res.json({Success:true, ResultType:'Array', Result:items});
	}
};
