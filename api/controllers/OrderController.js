module.exports = {

	index: function(req,res) {
		var start = Date.now();
		var items = [];
		/*
		if(typeof sails.storage.orders != 'undefined' && typeof sails.storage.orders != 'undefined') {
			for(var i in sails.storage.orders) {
				if(req.param('ID_Ring')!=null) {
					if(req.param('ID_Asset')!=null) {
						if(sails.storage.orders[i].ID_Ring == req.param('ID_Ring')*1 && sails.storage.orders[i].ID_Asset == req.param('ID_Asset')*1 && (sails.storage.orders[i].isActive || (!sails.storage.orders[i].isActive && sails.storage.orders[i].isSuspended))) {
							items.push(sails.storage.orders[i]);
							//console.log('found order');
							if(sails.storage.assets[sails.storage.orders[i].ID_Asset].AuctionType === 'simple' && sails.storage.orders[i].ID_Broker==req.session.currentUser.ID_Broker || (sails.storage.orders[i].ID_Agency==req.session.currentUser.ID_Agency && sails.storage.orders[i].isInitial)) {
								DeltaT.subscribe(req.socket,sails.storage.orders[i].ID);
								//DeltaT1.subscribe(req.socket,sails.storage.orders[i].ID);
								//console.log('socket subscribed to delta');
							}
							else {
								//console.log('ceva nu pusca..');
								//console.log(sails.storage.orders[i]);
							}
						}
					}
					else if(sails.storage.orders[i].ID_Ring == req.param('ID_Ring')*1) items.push(sails.storage.orders[i]);
				}
				else items.push(sails.storage.orders[i]);
			}
		}
		console.log(Date.now()-start);
		return res.json({Success:true, ResultType:'Array', Result:items});
		*/


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
						if(typeof err == 'string') return res.json({Success:false, ResultType:'GeneralError', Result: err});
						else return res.json(err);
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
						console.log('get orders: '+(Date.now()-start));
						return res.json({Success:true, ResultType:'Aray', Result: result.Rows});
					}
				);
			}
		);
	},

	details: function(req,res) {
		if(!req.param('id')) return res.json({Success:false, ResultType:'GeneralError', Result: 'missing id'});
		restService.select(
			'Order',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getOrderDetails',
				"objects":[
					{
						"Arguments": {
							"ID_Order": req.param('id')*1,
							"all": true
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

	/**
	* Action blueprints:
	*    `/orders/add`
	*/
	add: function (req, res) {
		var type = req.param('Direction');
		if(req.method == 'POST') {
			var moment = require('moment');
			var date = moment(req.param('Date')+' '+req.param('Time'),'DD MMM YYYY HH:mm:ss');
			if(req.param("isInitial")=='1') {
				var orderArgs = {
					"ID_Ring": req.param('ID_Ring')*1,
					"ID_Client": req.param('ID_Client')*1,
					"ID_Asset": -1,
					"ID_AssetType": req.param('ID_AssetType')*1,
					"AssetName": req.param('AssetName'),
					"AssetCode": req.param('AssetCode'),
					"AssetMeasuringUnit": req.param('AssetMeasuringUnit'),
					"AssetIsDefault": false,
					"Direction": req.param('Direction'),
					"Quantity": req.session.lang.code == 'EN' ? req.param('Quantity').replace(/,/g,'')*1 : req.param('Quantity').replace(/\./g,'').replace(',','.')*1,
					"Price": req.param('Price') == '' ? 'none' : (req.session.lang.code == 'EN' ? req.param('Price').replace(/,/g,'')*1 : req.param('Price').replace(/\./g,'').replace(',','.')*1),
					"ExpirationDate": date.format('YYYY-MM-DDTHH:mm:ss.SSS'),
					"isPartial":  req.param('isPartial')=='1'?true:false,
					"SubmitTime": req.param('SubmitTime'),
					"isInitial":  true
				}
			}
			else {
				var orderArgs = {
					"ID_Ring": req.param('ID_Ring')*1,
					"ID_Asset": req.param('ID_Asset')*1,
					"ID_Client": req.param('ID_Client')*1,
					"Direction": req.param('Direction'),
					"Quantity": req.session.lang.code == 'EN' ? req.param('Quantity').replace(/,/g,'')*1 : req.param('Quantity').replace(/\./g,'').replace(',','.')*1,
					"Price": req.param('Price') == '' ? 'none' : (req.session.lang.code == 'EN' ? req.param('Price').replace(/,/g,'')*1 : req.param('Price').replace(/\./g,'').replace(',','.')*1),
					"ExpirationDate": date.format('YYYY-MM-DDTHH:mm:ss.SSS'),
					"isPartial":  req.param('isPartial')=='1'?true:false,
					"SubmitTime": req.param('SubmitTime'),
					"isInitial":  false
				}
			}
		restService.select(
			'Order',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":"addOrder",
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments": orderArgs
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
              orderArgs.ID_Order = result.ID_Order;

							return res.json({Success:true, ResultType: 'Array', Result: orderArgs});
						}
					);
				}
			);
		}
		else return res.json({Success:false, ResultType:'GeneralError', Result:'no post data!'});
	},

	/**
	* Action blueprints:
	*    `/orders/validate`
	*/
	validate: function (req, res) {
		var type = req.param('Direction');
		if(req.method == 'POST') {
			var moment = require('moment');
			var date = moment(req.param('Date')+' '+req.param('Time'),'DD MMM YYYY HH:mm:ss');
			if(req.param("isInitial")=='1') {
				var arguments = {
					"ID_Ring": req.param('ID_Ring')*1,
					"ID_Asset": -1,
					"ID_AssetType": req.param('ID_AssetType')*1,
					"ID_Client": req.param('ID_Client') != '' ? req.param('ID_Client')*1 : null,
					"AssetName": req.param('AssetName'),
					"AssetCode": req.param('AssetCode'),
					"AssetMeasuringUnit": req.param('AssetMeasuringUnit'),
					"AssetIsDefault": false,
					"Direction": req.param('Direction'),
					"Quantity": req.session.lang.code == 'EN' ? req.param('Quantity').replace(/,/g,'')*1 : req.param('Quantity').replace(/\./g,'').replace(',','.')*1,
					"Price": req.session.lang.code == 'EN' ? req.param('Price').replace(/,/g,'')*1 : req.param('Price').replace(/\./g,'').replace(',','.')*1,
					"ExpirationDate": date.format('YYYY-MM-DDTHH:mm:ss.SSS'),
					"isPartial":  req.param('isPartial')=='1'?true:false,
					"SubmitTime": req.param('SubmitTime'),
					"isInitial":  true
				}
				if(req.param('ID')) arguments.ID_Order = req.param('ID')*1;
				else if(req.param('ID_Client')) arguments.ID_Client = req.param('ID_Client')*1;
			}
			else {
				var arguments = {
					"ID_Ring": req.param('ID_Ring')*1,
					"ID_Asset": req.param('ID_Asset')*1,
					"ID_Client": req.param('ID_Client') != '' ? req.param('ID_Client')*1 : null,
					"Direction": req.param('Direction'),
					"Quantity": req.session.lang.code == 'EN' ? req.param('Quantity').replace(/,/g,'')*1 : req.param('Quantity').replace(/\./g,'').replace(',','.')*1,
					"Price": req.param('Price') == '' ? 'none' : (req.session.lang.code == 'EN' ? req.param('Price').replace(/,/g,'')*1 : req.param('Price').replace(/\./g,'').replace(',','.')*1),
					"ExpirationDate": date.format('YYYY-MM-DDTHH:mm:ss.SSS'),
					"isPartial":  req.param('isPartial')=='1'?true:false,
					"SubmitTime": req.param('SubmitTime'),
					"isInitial":  false
				}
				if(req.param('ID')) arguments.ID_Order = req.param('ID')*1;
				else if(req.param('ID_Client')) arguments.ID_Client = req.param('ID_Client')*1;
			}
		restService.select(
			'Order',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":"validateOrder",
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":arguments
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
							console.log(result);
							return res.json({Success:true});
						}
					);
				}
			);
		}
		else return res.json({Success:false,ResultType:'GeneralError',Result:'no post data!'});
	},

	/**
	* Action blueprints:
	*    `/orders/precheck`
	*/
	precheck: function (req, res) {
		var type = req.param('Direction');
		if(req.method == 'POST') {
			var moment = require('moment');
			var date = moment(req.param('Date')+' '+req.param('Time'),'DD MMM YYYY HH:mm:ss');
		restService.select(
			'Order',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":"getOrderPrecheck",
					"service":'/BRMRead.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Ring": req.param('ID_Ring')*1,
								"ID_Asset": req.param('ID_Asset')*1,
								"Direction": req.param('Direction'),
								"Quantity": req.session.lang.code == 'EN' ? req.param('Quantity').replace(/,/g,'')*1 : req.param('Quantity').replace(/\./g,'').replace(',','.')*1,
								"Price": req.param('Price') == '' ? 'none' : (req.session.lang.code == 'EN' ? req.param('Price').replace(/,/g,'')*1 : req.param('Price').replace(/\./g,'').replace(',','.')*1),
								"Date": date.format('YYYY-MM-DDTHH:mm:ss.SSS'),
								"isPartial":  req.param('isPartial')=='1'?true:false,
								"isInitial":  false
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
		}
		else return res.json({Success:false, ResultType:'GeneralError', Result:'no post data!'});
	},

	/**
	* Action blueprints:
	*    `/orders/accept`
	*/
	accept: function (req, res) {
		if(!req.param('id')) return res.json({success:false,error:'missing parameter \'id\''});
		restService.select(
			'Order',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"service":'/BRMWrite.svc',
				"procedure":'acceptOrderMatch',
				"objects":
				[
					{
						"Arguments":
						{
							"ID_OrderMatch": req.param('id')*1
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
						if(result>0) {
							Order.publishDestroy(req.param('id'));
							return res.json({Success:true});
						}
						else return res.json({Success:false, ResultType:'GeneralError', Result:result});
					}
				);
			}
		);
	},

	/**
	* Action blueprints:
	*    `/orders/edit`
	*/
	edit: function (req, res) {
		var type = req.param('Direction');
		if(req.method == 'POST') {
			var moment = require('moment');
			var date = moment(req.param('Date')+' '+req.param('Time'),'DD MMM YYYY HH:mm:ss');
      var orderArgs = {
        "ID_Order": req.param('ID')*1,
        "ID_Ring": req.param('ID_Ring')*1,
        "ID_Asset": req.param('ID_Asset')*1,
        "Direction": req.param('Direction'),
        "Quantity": req.session.lang.code == 'EN' ? req.param('Quantity').replace(/,/g,'')*1 : req.param('Quantity').replace(/\./g,'').replace(',','.')*1,
        "Price": req.param('Price') == '' ? 'none' : (req.session.lang.code == 'EN' ? req.param('Price').replace(/,/g,'')*1 : req.param('Price').replace(/\./g,'').replace(',','.')*1),
        "ExpirationDate": date.format('YYYY-MM-DDTHH:mm:ss.SSS'),
        "isPartial":  req.param('isPartial')=='1'?true:false,
        "SubmitTime": req.param('SubmitTime'),
        "isInitial":  false
      };

		restService.select(
			'Order',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":"modifyOrder",
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments": orderArgs
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
              return res.json({Success:true, ResultType: 'Array', Result: orderArgs});
						}
					);
				}
			);
		}
		else return res.json({Success:false, ResultType:'GeneralError', Result:'no post data!'});
	},

	/**
	* Action blueprints:
	*    `/orders/cancel`
	*/
	cancel: function (req, res) {
		if(!req.param('id')) return res.json({Success:false, ResultType: 'GeneralError',Result:'missing parameter \'id\''});
		var message = '';
		if(req.method == 'POST') {
		restService.select(
			'Order',
				{
					"SessionId":req.sessionID,
					"currentState":'login',
					"method":'execute',
					"procedure":"cancelOrder",
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Order": req.param('id')*1
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
							return res.json({Success:true});
						}
					);
				}
			);
		}
		else return res.json({Success:false, ResultType:'GeneralError', Result:'no post data!'});
	},

	suspend: function (req, res) {
		if(!req.param('id')) return res.json({Success:false, ResultType: 'GeneralError',Result:'missing parameter \'id\''});
		var message = '';
		console.log(req.param('suspended'));
		var suspend = req.param('suspended')=='true' ? true : false;
		if(req.method == 'POST') {
		restService.select(
			'Order',
				{
					"SessionId":req.sessionID,
					"currentState":'login',
					"method":'execute',
					"procedure": suspend ? "suspendOrder" : "reactivateOrder",
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Order": req.param('id')*1
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
							return res.json({Success:true});
						}
					);
				}
			);
		}
		else return res.json({Success:false, ResultType:'GeneralError', Result:'no post data!'});
	},


	matches: function(req,res) {
		//if(!req.param('id')) return res.json({Success:false, ResultType:'GeneralError', Result:'missing order id'});
		if(!req.param('ID_Asset')) return res.json({Success:false, ResultType:'GeneralError', Result:'missing asset id'});
		var start = Date.now();
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
						if(typeof err == 'string') return res.json({Success:false, ResultType:'GeneralError', Result: err});
						else return res.json(err);
					},
					function(result){
						console.log('get matches: '+(Date.now()-start));
						return res.json({Success:true, ResultType:'Array', Result:result.Rows});
					}
				);
			}
		);
	},

	initial: function(req,res) {
		restService.select(
			'Order',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getInitialOrders',
				"objects":[
					{
						"Arguments":
						{
							"all": true,
							"anystatus": true
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

	approve: function (req, res) {
		if(!req.param('id')) return res.json({Success:false, ResultType: 'GeneralError',Result:'missing parameter \'id\''});
		var message = '';
		if(req.method == 'POST') {
		restService.select(
			'Order',
				{
					"SessionId":req.sessionID,
					"currentState":'login',
					"method":'execute',
					"procedure":"approveInitialOrder",
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Order": req.param('id')*1
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
							return res.json({Success:true});
						}
					);
				}
			);
		}
		else return res.json({Success:false, ResultType:'GeneralError', Result:'no post data!'});
	},

	reject: function (req, res) {
		if(!req.param('id')) return res.json({Success:false, ResultType: 'GeneralError',Result:'missing parameter \'id\''});
		var message = '';
		if(req.method == 'POST') {
		restService.select(
			'Order',
				{
					"SessionId":req.sessionID,
					"currentState":'login',
					"method":'execute',
					"procedure":"rejectInitialOrder",
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Order": req.param('id')*1
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
							return res.json({Success:true});
						}
					);
				}
			);
		}
		else return res.json({Success:false, ResultType:'GeneralError', Result:'no post data!'});
	},

	transactions: function(req,res) {
		if(!req.param('id')) return res.json({Success:false, ResultType:'GeneralError', Result:'missing order id'});
		restService.select(
			'Order',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getOrderTransactions',
				"objects":[
					{
						"Arguments":
						{
							"ID_Order": req.param('id')*1
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

	// admin actions

	orders: function (req, res) {
		var title = 'Ordine - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/orders/orders';
		var asset = null;
		if(req.param('asset')) {
			asset = req.param('asset');
		}
		restService.select(
			'Order',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getOrders',
				"objects":[
					{
						"Arguments":{
							"ID_Market":sails.marketId,
							"all":true,
							"ID_Asset":asset?asset:-1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view(view,{layout:layout, title:title, items:[]});
					},
					function(result){
						return res.view(view,{layout:layout, title:title, items:result.Rows});
					}
				);
			}
		);
	},

	order_add: function (req, res) {
		var title = 'Adaugare ordin - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/orders/order_add';
		var asset = null;
		if(req.param('asset')) {
			var asset_idx = toolsService.searchIdInArray(req.param('asset')*1,req.session.assets);
			if(asset_idx>-1) {
				asset = req.session.assets[asset_idx];
			}
			else {
				req.flash('error','Activul nu a fost gasit!');;
			}
		}
		if(req.method == 'POST') {
			var moment = require('moment');
			var date = moment(req.param('Date')+' '+req.param('Time'),'DD MMM YYYY HH:mm:ss');
			var arguments = {
								"ID_Market":sails.marketId,
								"ID_Ring": req.param('ID_Ring')*1,
								"ID_Asset": req.param('ID_Asset')*1,
								"ID_Broker": req.param('ID_Broker')*1,
								"Direction": req.param('Direction'),
								"Quantity": req.param('Quantity').replace(/\./g,'').replace(',','.')*1,
								"Price": req.param('Price') ? req.param('Price').replace(/\./g,'').replace(',','.')*1 : '',
								"ExpirationDate": date.format('YYYY-MM-DDTHH:mm:ss.SSS'),
								"PartialFlag":  req.param('PartialFlag')=='1'?true:false,
								"isInitial":  (req.param('isInitial')=='1'?true:false)
							};
			for(var i =0;i<req.session.params.length;i++) {
				arguments[req.session.params[i].label] = (req.param(req.session.params[i].label)=='1'?true:false);
			}
		restService.select(
			'Order',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'addOrder',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":arguments
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view(view,{layout:layout, title:title, item:req.body, asset:asset});
						},
						function(result){
							req.flash('success','Ordinul a fost adaugat cu succes!');
							if(req.param('submit')=='save') {
								return res.redirect('/admin/orders');
							}
							else {
								return res.redirect('/admin/asset_schedules/add?asset='+req.param('ID_Asset'));
							}
							return res.redirect('/admin/orders');
						}
					);
				}
			);
		}
		else return res.view(view,{layout:layout, title:title, asset:asset});
	},

	order_edit: function (req, res) {
		var title = 'Modificare ordin - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/orders/order_add';
		var asset = null;
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		if(req.method == 'POST') {
			var moment = require('moment');
			var date = moment(req.param('Date')+' '+req.param('Time'),'DD MMM YYYY HH:mm:ss');
			var arguments = {
				"ID_Order":req.param('id')*1,
				"ID_Market":sails.marketId,
				"ID_Ring": req.param('ID_Ring')*1,
				"ID_Asset": req.param('ID_Asset')*1,
				"ID_Broker": req.param('ID_Broker')*1,
				"Direction": req.param('Direction'),
				"Quantity": req.param('Quantity').replace(/\./g,'').replace(',','.')*1,
				"Price": req.param('Price') ? req.param('Price').replace(/\./g,'').replace(',','.')*1 : '',
				"ExpirationDate": date.format('YYYY-MM-DDTHH:mm:ss.SSS'),
				"PartialFlag":  req.param('PartialFlag')=='1'?true:false,
				"isInitial":  (req.param('isInitial')=='1'?true:false)
			};
			for(var i =0;i<req.session.params.length;i++) {
				arguments[req.session.params[i].label] = (req.param(req.session.params[i].label)=='1'?true:false);
			}
		restService.select(
			'Order',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'modifyOrder',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":arguments
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view(view,{layout:layout, title:title, item:req.body, asset:asset});
						},
						function(result){
							req.flash('success','Ordinul a fost modificat cu succes!');
							return res.redirect('/admin/orders');
						}
					);
				}
			);
		}
		else {
		restService.select(
			'Order',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'dashboard',
					"method":'select',
					"procedure":'getorders',
					"objects":[
						{
							"Arguments":{
								"ID_Market":sails.marketId,
								"ID_Order":req.param("id")*1,
								"all":true
							}
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view(view,{layout:layout, title:title, item:{}, asset:asset});
						},
						function(result){
							var found_item;
							_.each(result.Rows,function(item){
								if(item.ID==req.param('id')) found_item = item;
							});
							if(!found_item) return res.send(500,'Order not found!');
							return res.view(view,{layout:layout, title:title, item:found_item, asset:asset});
						}
					);
				}
			);
		}
	},

	initial_order: function (req, res) {
		var title = 'Ordin initiator - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/orders/initial_order';
		var asset = null;
		if(req.param('asset')) {
			asset = req.session.orderAsset;
		}
		if(!asset) {
			res.send(500,'Activul nu a fost gasit.');
		}
		if(asset && asset.ID_InitialOrder) {
			if(req.method == 'POST') {
				var moment = require('moment');
				var date = moment(req.param('Date')+' '+req.param('Time'),'DD MMM YYYY HH:mm:ss');
				var arguments = {
					"ID_Order":asset.ID_InitialOrder,
					"ID_Market":sails.marketId,
					"ID_Ring": req.param('ID_Ring')*1,
					"ID_Asset": req.param('ID_Asset')*1,
					"ID_Agency": req.param('ID_Agency')*1,
					"ID_Client": req.param('ID_Client')*1,
					"Direction": req.param('Direction'),
					"Quantity": req.param('Quantity').replace(/\./g,'').replace(',','.')*1,
					"Price": req.param('Price') ? req.param('Price').replace(/\./g,'').replace(',','.')*1 : 'none',
					"ExpirationDate": date.format('YYYY-MM-DDTHH:mm:ss.SSS'),
					"PartialFlag":  req.param('PartialFlag')=='1'?true:false,
					"isActive":true,
					"isInitial":  true
				};
				/*
				for(var i =0;i<req.session.params.length;i++) {
					arguments[req.session.params[i].label] = (req.param(req.session.params[i].label)=='1'?true:false);
				}*/
		restService.select(
			'Order',
					{
						"SessionId":sessionService.getSessionID(req),
						"currentState":'login',
						"method":'execute',
						"procedure":'modifyOrder',
						"service":'/BRMWrite.svc',
						"objects":[
							{
								"Arguments": arguments
							}
						]
					},
					function(error,response) {
						return parserService.parse(error,response,
							function(err){
								req.flash('error',err);
								var postItem = req.body;
								postItem.ID = asset.ID_InitialOrder;
								return res.view(view,{layout:layout, title:title, item:postItem, asset:asset});
							},
							function(result){
								if(req.param('Validate')=='1') {
		restService.select(
			'Ring',
										{
											"SessionId":sessionService.getSessionID(req),
											"currentState":'dashboard',
											"method":'select',
											"procedure":'validate',
											"objects":[{
												"Arguments":{
													"ID_Asset":req.param('ID_Asset')*1,
													"ID_Market":sails.marketId
												}
											}]
										},
										function(error,response) {
											return parserService.parse(error,response,
												function(err){
													req.flash('error',err);
													var postItem = req.body;
													postItem.ID = asset.ID_InitialOrder;
													return res.view(view,{layout:layout, title:title, item:postItem, asset:asset});
												},
												function(result){
													toolsService.parseValidation(result,req);
													var postItem = req.body;
													postItem.ID = asset.ID_InitialOrder;
													return res.view(view,{layout:layout, title:title, item:postItem, asset:asset});
												}
											);
										}
									);
								}
								else {
									return res.redirect('/admin/asset_schedules/schedules?asset='+req.param('ID_Asset'));
								}
							}
						);
					}
				);
			}
			else {
		restService.select(
			'Order',
					{
						"SessionId":sessionService.getSessionID(req),
						"currentState":'dashboard',
						"method":'select',
						"procedure":'getorders',
						"objects":[
							{
								"Arguments":{
									"ID_Market":sails.marketId,
									"ID_Order":asset.ID_InitialOrder*1,
									"anystatus":true,
									"all":true
								}
							}
						]
					},
					function(error,response) {
						return parserService.parse(error,response,
							function(err){
								req.flash('error',err);
								return res.view({layout:layout, title:title, item:{}, asset:asset});
							},
							function(result){
								var found_item;
								_.each(result.Rows,function(item){
									if(item.ID==asset.ID_InitialOrder) found_item = item;
								});
								if(!found_item) return res.send(500,'Order not found!');
								return res.view(view,{layout:layout, title:title, item:found_item, asset:asset});
							}
						);
					}
				);
			}
			//return res.view({layout:layout, title:title, asset:asset});
		}
		else {
			if(req.method == 'POST') {
				var moment = require('moment');
				var date = moment(req.param('Date')+' '+req.param('Time'),'DD MMM YYYY HH:mm:ss');
				var arguments = {
					"ID_Market":sails.marketId,
					"ID_Ring": req.param('ID_Ring')*1,
					"ID_Asset": req.param('ID_Asset')*1,
					"ID_Agency": req.param('ID_Agency')*1,
					"ID_Client": req.param('ID_Client')*1,
					"Direction": req.param('Direction'),
					"Quantity": req.param('Quantity').replace(/\./g,'').replace(',','.')*1,
					"Price": req.param('Price') ? req.param('Price').replace(/\./g,'').replace(',','.')*1 : 'none',
					"ExpirationDate": date.format('YYYY-MM-DDTHH:mm:ss.SSS'),
					"PartialFlag": req.param('PartialFlag')=='1'?true:false,
					//"DifferentialPriceText": req.param('DifferentialPriceText'),
					"isActive":true,
					"isInitial":  true
				};
				/*
				for(var i =0;i<req.session.params.length;i++) {
					arguments[req.session.params[i].label] = (req.param(req.session.params[i].label)=='1'?true:false);
				}
				*/
		restService.select(
			'Order',
					{
						"SessionId":sessionService.getSessionID(req),
						"currentState":'login',
						"method":'execute',
						"procedure":'addOrder',
						"service":'/BRMWrite.svc',
						"objects":[
							{
								"Arguments": arguments
							}
						]
					},
					function(error,response) {
						return parserService.parse(error,response,
							function(err){
								req.flash('error',err);
								return res.view(view,{layout:layout, title:title, item:req.body, asset:asset});
							},
							function(result){
								if(req.param('Validate')=='1') {
		restService.select(
			'Ring',
										{
											"SessionId":sessionService.getSessionID(req),
											"currentState":'dashboard',
											"method":'select',
											"procedure":'validate',
											"objects":[{
												"Arguments":{
													"ID_Asset":req.param('ID_Asset')*1,
													"ID_Market":sails.marketId
												}
											}]
										},
										function(error,response) {
											return parserService.parse(error,response,
												function(err){
													req.flash('error',err);
													return res.view(view,{layout:layout, title:title, item:req.body, asset:asset});
												},
												function(result){
													toolsService.parseValidation(result,req);
													return res.view(view,{layout:layout, title:title, item:req.body, asset:asset});
												}
											);
										}
									);
								}
								else {
									return res.redirect('/admin/asset_schedules/schedules?asset='+req.param('ID_Asset'));
								}
							}
						);
					}
				);
			}
			else {
				var asset_type = {};
				if(asset) {
					var idx = toolsService.searchIdInArray(asset.ID_AssetType,sails.storage.assetTypes);
					if(idx>-1) {
						asset_type = sails.storage.assetTypes[idx];
					}
				}
				return res.view(view,{layout:layout, title:title, asset:asset, item:{}, asset_type: asset_type});
			}
		}
	},

	order_delete: function (req, res) {
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		restService.select(
			'Order',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"procedure":'cancelOrder',
				"service":'/BRMWrite.svc',
				"objects":[
					{
						"Arguments":{
							"ID_Order":req.param('id')*1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.redirect('/admin/orders');
					},
					function(result){
						req.flash('success','Ordinul a fost anulat cu succes!');
						return res.redirect('/admin/orders');
					}
				);
			}
		);
	}
};
