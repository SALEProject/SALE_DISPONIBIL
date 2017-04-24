var async = require('async');
//var sizeof = require('object-sizeof');
//const child_process = require('child_process');

 exports.getMarketParams = function(callback) {
	if(typeof sails.processes.market == 'undefined') sails.processes.market = false;
	if(!sails.processes.market) {
		sails.processes.market = true;
		if(typeof sails.storage.market == 'undefined') sails.storage.market = {};
		//if(typeof sails.storage.market.Items == 'undefined') sails.storage.market.Items = [];
		//if(typeof sails.storage.market.Ids == 'undefined') sails.storage.market.Ids = [];
		/*if(typeof sails.storage.market.LastTimestamp == 'undefined') {
			var since = new Date();
			since.setHours(0,0,0);
			sails.storage.chat.LastTimestamp = since;
		}*/
		restService.select(
			'Market',
			{
				"SessionId":'AppSessionDisponibil',
				"currentState":'login',
				"method":'select',
				"procedure":'getMarketParameters'
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						logService.debug(err);
						if(typeof callback !='undefined') return callback();
					},
					function(result){
						if(result.Rows.length>0) {
							sails.storage.market = result.Rows[0];
							if(typeof callback =='undefined') Market.publishUpdate(1, sails.storage.market);
						}
						sails.processes.market = false;
						if(typeof callback !='undefined') return callback();
					}
				);
			}
		);
	}
};


 exports.getTranslations = function(callback) {
	if(typeof sails.processes.translations == 'undefined') sails.processes.translations = false;
	if(!sails.processes.translations) {
		sails.processes.translations = true;
		var new_trans = {};
		if(typeof sails.storage.translations == 'undefined') sails.storage.translations = {};
		restService.select(
			'Nomenclator',
			{
				"SessionId":'AppSessionDisponibil',
				"currentState":'login',
				"method":'select',
				"procedure":'getTranslations',
				"objects":[{
					Arguments: {
						SysLabels: false
					}
				}]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						logService.debug(err);
						if(typeof callback !='undefined') return callback();
					},
					function(result){
						if(result.Rows.length>0) {
							for(var i=0;i<result.Rows.length;i++) {
								new_trans[result.Rows[i].Label] = result.Rows[i];
							}
						}
						//console.log('object:' + sizeof(new_trans));
						//console.log('array:' + sizeof(result.Rows));
						sails.processes.translations = false;
						sails.storage.translations = new_trans;
						//console.log(sizeof(sails.storage.translations));
						//Translation.publishCreate({id:1});
						if(typeof callback !='undefined') return callback();
					}
				);
			}
		);
	}
	else {
		if(typeof callback !='undefined') return callback();
	}
};

 exports.addTranslation = function(id) {
	if(typeof sails.storage.translations == 'undefined') return;
		restService.select(
		'Nomenclator',
		{
			"SessionId":'AppSessionDisponibil',
			"currentState":'login',
			"method":'select',
			"procedure":'getTranslations',
			"objects":[{
				Arguments: {
					"ID_Translation":id
				}
			}]
		},
		function(error,response) {
			return parserService.parse(error,response,
				function(err){
					logService.debug(err);
					return;
				},
				function(result){
					if(result.Rows.length>0) {
						for(var i=0;i<result.Rows.length;i++) {
							if(result.Rows[i].sys) {
								sails.storage.sysTranslations[result.Rows[i].Label] = result.Rows[i];
							}
							else {
								sails.storage.translations[result.Rows[i].Label] = result.Rows[i];
							}
						}
					}
				}
			);
		}
	);
};

 exports.getSysTranslations = function(callback) {
	if(typeof sails.processes.sysTranslations == 'undefined') sails.processes.sysTranslations = false;
	if(!sails.processes.sysTranslations) {
		sails.processes.sysTranslations = true;
		var new_trans = {};
		if(typeof sails.storage.sysTranslations == 'undefined') sails.storage.sysTranslations = {};
		restService.select(
			'Nomenclator',
			{
				"SessionId":'AppSessionDisponibil',
				"currentState":'login',
				"method":'select',
				"procedure":'getTranslations',
				"objects":[{
					Arguments: {
						SysLabels: true
					}
				}]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						logService.debug(err);
						if(typeof callback !='undefined') return callback();
					},
					function(result){
						if(result.Rows.length>0) {
							for(var i=0;i<result.Rows.length;i++) {
								new_trans[result.Rows[i].Label] = result.Rows[i];
							}
						}
						//console.log('sys object:' + sizeof(new_trans));
						//console.log('array:' + sizeof(result.Rows));
						sails.processes.sysTranslations = false;
						sails.storage.sysTranslations = new_trans;
						//console.log(sizeof(sails.storage.translations));
						Translation.publishCreate({id:1});
						if(typeof callback !='undefined') return callback();
					}
				);
			}
		);
	}
	else {
		if(typeof callback !='undefined') return callback();
	}
};

exports.getChat = function(callback) {
	if(typeof sails.processes.chat == 'undefined') sails.processes.chat = false;
	if(!sails.processes.chat) {
		sails.processes.chat = true;
		if(typeof sails.storage.chat == 'undefined') sails.storage.chat = {};
		if(typeof sails.storage.chat.Items == 'undefined') sails.storage.chat.Items = [];
		if(typeof sails.storage.chat.Ids == 'undefined') sails.storage.chat.Ids = [];
		if(typeof sails.storage.chat.LastTimestamp == 'undefined') {
			var since = new Date();
			since.setHours(0,0,0);
			sails.storage.chat.LastTimestamp = since;
		}
		restService.select(
			'Chat',
			{
				"SessionId":'AppSessionDisponibil',
				"currentState":'login',
				"method":'select',
				"procedure":'getChatHistory',
				"objects":
				[
					{
						"Arguments":
						{
							"Since":sails.storage.chat.LastTimestamp.toISOString()
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						logService.debug(err);
						if(typeof callback !='undefined') return callback();
					},
					function(result){
						_.each(result.Rows,function(item){
							if(sails.storage.chat.Ids.indexOf(item.ID)==-1) {
								sails.storage.chat.Ids.push(item.ID);
								sails.storage.chat.Items.push(item);
								sails.storage.chat.LastTimestamp = new Date(item.Date);
								if(typeof callback =='undefined') {
									//console.log(item);
									Chat.publishCreate({id:item.ID, item:item});
								}
							}
						});
						sails.processes.chat = false;
						if(typeof callback !='undefined') return callback();
					}
				);
			}
		);
	}
};

exports.getOrders = function(callback) {
	sails.storage.orders = {};
	if(typeof callback !='undefined') return callback();
	return;


	if(typeof sails.processes.orders == 'undefined') sails.processes.orders = false;
	if(!sails.processes.orders) {
		sails.processes.orders = true;
		if(typeof sails.storage.orders == 'undefined') sails.storage.orders = {};
		restService.select(
		'Order',
			{
				"SessionId":'AppSessionDisponibil',
				"currentState":'login',
				"method":'select',
				"procedure":'getOrders',
				"objects":[
					{
						"Arguments":
						{
							"all": true,
							"anystatus":true
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						logService.debug(err);
						if(typeof callback !='undefined') return callback();
					},
					function(result){
						//console.log('orders count: '+result.Rows.length);
						_.each(result.Rows,function(item){
							//if(toolsService.searchIdInArray(item.ID,sails.storage.orders.Items)==-1 && item.isActive && !item.isTransacted) {
							//if(typeof sails.storage.orders[item.ID] == 'undefined' && (item.isActive || (!item.isActive && item.isSuspended)) && !item.isCanceled && !item.isTransacted) {
							if(item.isActive || item.isSuspended) {
								//sails.storage.orders.Ids.push(item.ID);
								sails.storage.orders[item.ID] = item;
								if(typeof callback == 'undefined') Order.publishCreate({id:item.ID, item:item});
							}
						});
						//console.log(sizeof(sails.storage.orders));
						sails.processes.orders = false;
						if(typeof callback !='undefined') return callback();
					}
				);
			}
		);
	}
};


exports.getAssets = function(callback) {
	if(typeof sails.processes.assets == 'undefined') sails.processes.assets = false;
	if(!sails.processes.assets) {
		sails.processes.assets = true;
		if(typeof sails.storage.assets == 'undefined') sails.storage.assets = {};
		//if(typeof sails.storage.assets.Items == 'undefined') sails.storage.assets.Items = [];
		//if(typeof sails.storage.assets.Ids == 'undefined') sails.storage.assets.Ids = [];
		restService.select(
		'Ring',
			{
				"SessionId":'AppSessionDisponibil',
				"currentState":'login',
				"method":'select',
				"procedure":'getAssets',
				"objects":[
					{
						"Arguments":
						{
							"ID_Market": sails.config.marketId,
							"ID_Ring": -1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						logService.debug(err);
						if(typeof callback !='undefined') return callback();
						sails.processes.assets = false;
					},
					function(result){
						_.each(result.Rows,function(item){

							if(!item.isActive && typeof sails.storage.assets[item.ID] != 'undefined') {
								delete sails.storage.assets[item.ID];
							}
							else {
								sails.storage.assets[item.ID] = item;
							}
							/*
							var idx = toolsService.searchIdInArray(item.ID,sails.storage.assets.Items);
							if(idx==-1 && item.isActive) {
								//sails.storage.orders.Ids.push(item.ID);
								sails.storage.assets.Items.push(item);
								//if(typeof callback == 'undefined') Asset.publishCreate({id:item.ID, item:item});
							}
							else {
								sails.storage.assets.Items[idx] = item;
							}
							*/
						});
						sails.processes.assets = false;
						if(typeof callback !='undefined') return callback();
					}
				);
			}
		);
	}
};


exports.getAlerts = function(callback) {
	if(typeof sails.processes.alerts == 'undefined') sails.processes.alerts = false;
	if(!sails.processes.alerts) {
		sails.processes.alerts = true;
		if(typeof sails.storage.alerts == 'undefined') sails.storage.alerts = {};
		if(typeof sails.storage.alerts.Items == 'undefined') sails.storage.alerts.Items = {};
		if(typeof sails.storage.alerts.Ids == 'undefined') sails.storage.alerts.Ids = [];
		if(typeof sails.storage.alerts.LastTimestamp == 'undefined') {
			var since = new Date();
			since.setHours(-24,0,0);
			sails.storage.alerts.LastTimestamp = since;
		}
		logService.debug('fetching alerts..');
		restService.select(
		'Alert',
			{
				"SessionId":'AppSessionDisponibil',
				"currentState":'login',
				"method":'select',
				"procedure":'getAlerts',
				"objects":[
					{
						"Arguments":
						{
							"Since":sails.storage.alerts.LastTimestamp.toISOString()
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						logService.debug(err);
						if(typeof callback !='undefined') return callback();
					},
					function(result){
						logService.debug('found '+result.Rows.length+' alerts..');
						_.each(result.Rows,function(item){
							if(sails.storage.alerts.Ids.indexOf(item.ID)==-1) {
								sails.storage.alerts.Ids.push(item.ID);
								sails.storage.alerts.Items[item.ID] = item;
								sails.storage.chat.LastTimestamp = new Date(item.Date);
								if(typeof callback =='undefined') Alert.publishCreate({id:item.ID, item:item});
							}
						});
						//logService.debug('total alerts: '+sails.storage.alerts.Ids.length);
						sails.processes.alerts = false;
						if(typeof callback !='undefined') return callback();
					}
				);
			}
		);
	}
};

exports.startEventsTimer = function(callback) {

	/*
	var worker_process = child_process.fork("eventProcess.js", [], {"cwd": "/var/www/nodejs/disponibil-dev"});
	worker_process.on('error', function (err) {
		console.log('eventProcess error', err);
	});
	worker_process.on('data', function (data) {
		console.log('eventProcess: ' + data);
	});
	worker_process.on('close', function (code) {
		console.log('child process exited with code ' + code);
	});
	worker_process.send('server',sails.sockets);
	*/

			if(typeof sails.timers.events == 'undefined') {
				sails.timers.events = setInterval(function(){
					if(typeof sails.processes.events == 'undefined') sails.processes.events = false;
					//console.log('running events update '+sails.processes.events);
					if(!sails.processes.events) {
						sails.processes.events = true;
						if(typeof sails.storage.events == 'undefined') sails.storage.events = {};
						//if(typeof sails.storage.events.Items == 'undefined') sails.storage.events.Items = {};
						if(typeof sails.storage.events.Ids == 'undefined') sails.storage.events.Ids = [];

            var params = {
              "SessionId":'AppSessionDisponibil',
              "currentState":'login',
              "method":'select',
              "procedure":'getEvents'
            };

						if(typeof sails.storage.events.LastTimestamp == 'undefined') {
							var since = new Date();
							//since.setHours(0,0,0);
							//console.log(since.toISOString());
							sails.storage.events.LastTimestamp = since.toISOString();

              params.objects = [
                {
                  "Arguments":
                  {
                    "Since": sails.storage.events.LastTimestamp
                  }
                }
              ];
						}

		restService.select(
		'Event',
						params, function(error,response) {
								return parserService.parse(error,response, function(err){
										logService.debug(err);
										sails.processes.events = false;
									}, function(result){
                    if(result.Rows.length == 0) {
                      sails.processes.events = false;
                    }

					for(var i = 0; i<result.Rows.length; i++) {
						eventService.processEvent(result.Rows[i], function () {
						});
					}
                      sails.processes.events = false;
					  
					  /*
										async.forEachSeries(result.Rows, function(item, cb) {
											eventService.processEvent(item, function () {
												return cb();
											});
										}, function () {
											sails.processes.events = false;
										});
										
										*/
									}
								);
							});
					}
				},500);
			}
	return callback();
};

exports.processEvent = function(item, callback) {
	if(sails.storage.events.Ids.indexOf(item.ID)==-1) {
		//console.log('new event: '+item.ID+' '+item.EventType+' '+item.Resource);
		sails.storage.events.Ids.push(item.ID);
		//sails.storage.events.Items[item.ID] = item;
		sails.storage.events.LastTimestamp = item.Date;
		switch(item.Resource) {
			case 'Orders':
				switch(item.EventType) {
					case 'insert':
					case 'update':
					case 'delete':
						//get order details, add it to orders list and send socket message
						eventService.addOrder(item.ID_Resource);
						break;
				}
				break;
			case 'OrderMatches':
				// send socket message that order has matches
				//eventService.addOrder(item.ID_LinkedResource);
				OrderMatch.publishCreate({id:item.ID,item:item,isDelete:(item.EventType=='delete'?true:false)});
				break;
			case 'Journal':
				// send socket message with new activity log
				eventService.addJournal(item.ID_Resource);
				break;
			case 'Transactions':
				// send socket message that new transaction is available
				//console.log(item);
				Transaction.publishCreate({id:item.ID_Resource,ID_Asset:item.ID_LinkedResource});
				//RingSession.publishUpdate(1,{});
				break;
			case 'Alerts':
				// update alerts
				eventService.getAlerts();
				//RingSession.publishUpdate(1,{});
				break;
			case 'Messages':
				// update chat list
				eventService.getChat();
				break;
			case 'Markets':
				// send socket message that new market chart data is available
				eventService.getMarketParams();
				Market.publishCreate({id:item.ID_Resource});
				break;
			case 'RingSessions':
				// send socket message to update ring session stats
				RingSession.publishCreate({id:item.ID_Resource});
				break;
			case 'Assets':
				// send socket message to update ring session stats
				eventService.getAssets();
				Asset.publishCreate({id:item.ID_Resource});
				break;
			case 'AssetSessions':
				// send socket message to update ring session stats
				eventService.getAssets();
				if(item.ID_LinkedResource) AssetSession.publishCreate({id:item.ID_LinkedResource});
				break;
			case 'DeltaT':
				//DeltaT.publishCreate({id:item.ID_Resource, item:{ID_Order:item.ID_LinkedResource,ID_Asset:item.ID_Resource}});
				break;
			case 'DeltaT1':
				//DeltaT1.publishCreate({id:item.ID_Resource, item:{ID_Order:item.ID_LinkedResource,ID_Asset:item.ID_Resource}});
				break;
			case 'Rings':
				Ring.publishCreate({id:item.ID_Resource});
				break;
			case 'Translations':
				if(item.EventType != 'delete') {
					eventService.addTranslation(item.ID_Resource);
				}
				break;
			case 'AssetsXClients':
				if(item.ID_LinkedResource) AssetSession.publishCreate({id:item.ID_LinkedResource});
				break;
			case 'Users':
				if(item.EventType == 'disable') {
					if(typeof sails.storage.userSessions[item.ID_Resource] != 'undefined') { // add check for admin user which has no socket connection
						//console.log('user disabled');
						delete sails.storage.userSessions[item.ID_Resource];
					}
				}
				break;
			default:
				//console.log(item);
		}
	}
	else {
		//console.log('event already processed #'+item.ID);
	}
	if(typeof callback != 'undefined') {
		callback();
	}
};

exports.startUsersTimer = function() {
	if(typeof sails.processes.users == 'undefined') sails.processes.users = {};
	if(typeof sails.timers.users == 'undefined') {
		sails.timers.users = setInterval(function(){
			if(!sails.processes.users) {
				sails.processes.users = true;
				if(typeof sails.storage.userSessions != 'undefined') {
					for(var i in sails.storage.userSessions) {
						if(sails.storage.userSessions[i].lastUpdate<Date.now()-1000*60 && sails.storage.userSessions[i].socket == null && !sails.storage.userSessions[i].user.isAdministrator) { // add check for admin user which has no socket connection
							//console.log('user session expired');
							delete sails.storage.userSessions[i];
						}
					}
				}
				sails.processes.users = false;
			}
		},1000*60);
	}
};

exports.startDeltaTimer = function(callback) {
	if(typeof sails.processes.delta == 'undefined') sails.processes.delta = false;
	if(typeof sails.processes.deltas == 'undefined') sails.processes.deltas = {};
	if(typeof sails.timers.delta == 'undefined') {
		sails.timers.delta = setInterval(function(){
			if(!sails.processes.delta) {
				sails.processes.delta = true;
				if(typeof sails.storage.assets != 'undefined') {
					var c = 0;
					var length = Object.keys(sails.storage.assets).length;
					for(var i in sails.storage.assets) {
						if(sails.storage.assets[i].Status=='PreOpened' || sails.storage.assets[i].Status=='Opened' || sails.storage.assets[i].Status=='PreClosed') {
							eventService.updateAssetDelta(sails.storage.assets[i].ID);
						}
						c++;
						if(c == length) {
							sails.processes.delta = false;
						}
					}
				}
			}
		},1000);
	}
	return callback();
};

exports.updateAssetDelta = function(id) {
	if(typeof sails.processes.deltas[id] == 'undefined') sails.processes.deltas[id] = false;
	if(!sails.processes.deltas[id]) {
		sails.processes.deltas[id] = true;
		restService.select(
		'RingSession',
		{
				"SessionId":'AppSessionDisponibil',
				"currentState":'login',
				"method":'select',
				"procedure":'getDeltaTimings',
				"objects":[
					{
						"Arguments":
						{
							"ID_Asset": id
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						logService.debug(err);
						sails.processes.deltas[id] = false;
					},
					function(result){
						if(result.Rows.length>0) {
							var assetBrokers = [];
							for(var i=0;i<result.Rows.length;i++) {
								var item = result.Rows[i];
								if(assetBrokers.indexOf(item.ID_Broker)==-1) {
									assetBrokers.push(item.ID_Broker);
									var asset = sails.storage.assets[id];
									//console.log(asset.AuctionType);
									if(asset.AuctionType === 'simple' && typeof item.DeltaTStarted != 'undefined' && typeof item.DeltaTRemaining != 'undefined' && item.DeltaTStarted && item.DeltaTRemaining>=0) {
										if(item.ID_Order) {
											//console.log(item);
											//DeltaT.publishCreate({id:item.ID_Order, item:{ID_Order:item.ID_Order, ID_Client:item.ID_Client,DeltaTRemaining:item.DeltaTRemaining,ID_Agency:item.ID_Agency,ID_Asset:id,ID_Broker:item.ID_Broker}});
											DeltaT.publishUpdate(item.ID_Order, {ID_Order:item.ID_Order, ID_Client:item.ID_Client,DeltaTRemaining:item.DeltaTRemaining,ID_Agency:item.ID_Agency,ID_Asset:id,ID_Broker:item.ID_Broker});
										}
										else if(item.ID_Broker) {
											DeltaTBroker.publishUpdate(item.ID_Broker, {ID_Order:item.ID_Order, ID_Client:item.ID_Client,DeltaTRemaining:item.DeltaTRemaining,ID_Agency:item.ID_Agency,ID_Asset:id,ID_Broker:item.ID_Broker});
										}
									}
									if(typeof item.DeltaT1Started != 'undefined' && typeof item.DeltaT1Remaining != 'undefined' && item.DeltaT1Started && item.DeltaT1Remaining>=0) {
										if(item.ID_Order) {
											DeltaT1.publishCreate({id:item.ID_Order, item:{ID_Order:item.ID_Order, ID_Client:item.ID_Client,DeltaT1Remaining:item.DeltaT1Remaining,ID_Agency:item.ID_Agency,ID_Asset:id,ID_Broker:item.ID_Broker}});
											//DeltaT1.publishUpdate(item.ID_Order, {ID_Order:item.ID_Order, ID_Client:item.ID_Client,DeltaT1Remaining:item.DeltaT1Remaining,ID_Agency:item.ID_Agency,ID_Asset:id,ID_Broker:item.ID_Broker});
										}
										else if(item.ID_Broker) {
											DeltaT1Broker.publishUpdate(item.ID_Broker, {ID_Order:item.ID_Order, ID_Client:item.ID_Client,DeltaT1Remaining:item.DeltaT1Remaining,ID_Agency:item.ID_Agency,ID_Asset:id,ID_Broker:item.ID_Broker});
										}
									}
								}
							}
						}
						sails.processes.deltas[id] = false;
					}
				);
			}
		);
	}
};

exports.addOrder = function(id) {
		restService.select(
		'Order',
	{
			"SessionId":'AppSessionDisponibil',
			"currentState":'login',
			"method":'select',
			"procedure":'getOrderDetails',
			"objects":[
				{
					"Arguments":
					{
						"ID_Order": id,
						"anystatus": true,
						"all": true
					}
				}
			]
		},
		function(error,response) {
			return parserService.parse(error,response,
				function(err){
					logService.debug(err);
				},
				function(result){
					_.each(result.Rows,function(item){
						/*
						if(typeof sails.storage.orders[item.ID] == 'undefined') {
							if(!item.isTransacted && (item.isActive || (!item.isActive && item.isSuspended)) && !item.isCanceled) {
								sails.storage.orders[item.ID] = item;
							}
							Order.publishCreate({id:item.ID, item:item});
						}
						else {
							if(item.isTransacted || !(item.isActive || (!item.isActive && item.isSuspended)) || item.isCanceled) {
								delete sails.storage.orders[item.ID];
							}
							else {
								sails.storage.orders[item.ID] = item;
							}
							Order.publishCreate({id:item.ID, item:item});
						}
						*/
						/*
						if(item.isCanceled || (!item.isActive && !item.isTransacted && !item.isSuspended) && typeof sails.storage.orders[item.ID] != 'undefined') {
							delete sails.storage.orders[item.ID];
						}
						else {
							sails.storage.orders[item.ID] = item;
						}
						*/

						/*
						if(item.isCanceled || item.isTransacted || !(item.isActive || item.isTransacted || item.isSuspended || item.isCanceled) && typeof sails.storage.orders[item.ID] != 'undefined') {
							delete sails.storage.orders[item.ID];
						}
						else {
							sails.storage.orders[item.ID] = item;
						}
						*/
						Order.publishCreate({id:item.ID, item:item});
					});
				}
			);
		}
	);
};

exports.addJournal = function(id) {
		restService.select(
		'Journal',
		{
			"SessionId":'AppSessionDisponibil',
			"currentState":'login',
			"method":'select',
			"procedure":'getJournal',
			"objects":
			[
				{
					"Arguments":
					{
						"ID_Journal": id
					}
				}
			]
		},
		function(error,result) {
		// Error handling
		  if (error) {
			console.log('BUUUUU:'+error);
		  // The Book was found successfully!
		  } else {
			toolsService.parseResponse(result,function(msg) {
				console.log('success but failed:'+msg);
			},
			function(resultObject) {
				if(resultObject.Rows.length>0) {
					var item = resultObject.Rows[0];
					Journal.publishCreate({id:item.ID,item:item});
				}
			});
		  }
	});
};

exports.getActiveOrdersCount = function() {
	if(typeof sails.storage.orders!='undefined') {
		var count = 0;
		for(var i in sails.storage.orders) {
			if(typeof sails.storage.orders[i] != 'undefined' && sails.storage.orders[i].isActive) count++;
		}
		return count;
	}
	return 0;
};

exports.getLastTransactions = function() {
	if(typeof sails.storage.orders!='undefined') {
		var count = 0;
		_.each(sails.storage.orders.Items,function(item) {
			if(typeof item!='undefined' && item.isActive) count++;
		});
		return count;
	}
	return 0;
};
