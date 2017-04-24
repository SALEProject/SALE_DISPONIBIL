module.exports = {
  
	index: function (req, res) {
		//sails.Session.get(sessionId, cb)
		/*
		req.sessionStore.get(sessionService.getSessionID(req), function (error, val) {
			if (error !== null) console.log("error: " + error);
			else {
				console.log(val);
			}
		});
		*/
		restService.select(
			'Transaction',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getStatistics',
					"objects":[{
						"Arguments":{
							"ID_Market":sails.marketId
						}
					}]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view({layout:'adminLayout', title:'Panou de control - '+sails.config.appName, item:{}, statistics: {}});
						},
						function(result){
							/*var stats;
							_.each(result.Rows,function(item){
								stats = item; 
							});*/
							if(!result.Rows) return res.send(500,'Transaction infos not found!');
							return res.view({layout:'adminLayout', title:'Panou de control - '+sails.config.appName, statistics:result.Rows[0]});
						}
					);
				}
			);
		//return res.view({layout:'adminLayout', title:'Panou de control - '+sails.config.appName});
	}

};
