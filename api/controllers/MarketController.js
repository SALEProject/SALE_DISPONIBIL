module.exports = {

	/**
	* Action blueprints:
	*    `/market/index`
	*/
	index: function (req, res) {
		return res.redirect('/');
	},

	/**
	* Action blueprints:
	*    `/market/chart`
	*/
    chart: function (req, res) {
		restService.select(
			'Transaction',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getMarketChartData'
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

	/**
	* Action blueprints:
	*    `/market/assets`
	*/
    assets: function (req, res) {
		restService.select(
			'Ring',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getTradeInstruments',
				"objects": [
					{
						"Arguments": {
							"ID_Ring": req.param('ID_Ring')*1,
							"ID_AssetType": req.param('ID_AssetType')*1
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

	/**
	* Action blueprints:
	*    `/market/stats`
	*/
	stats: function (req, res) {
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
							"ID_Ring": req.param('ID_Ring')*1,
							"ID_Asset": req.param('ID_Asset')*1
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
						if(result.Rows.length>0) var item = result.Rows[0];
						else var item = {};
						item.OrdersCount = eventService.getActiveOrdersCount();
						return res.json({Success:true, ResultType: 'Object', Result:item});
					}
				);
			}
		);
	}
};
