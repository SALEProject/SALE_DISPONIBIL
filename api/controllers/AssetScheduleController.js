module.exports = {

	index: function (req, res) {
		if(!req.param('ID_Ring')) return res.json({Success:false, ResultType:'GeneralError', Result: 'missing parameter \'ID_Ring\''});
		if(!req.param('ID_Asset')) return res.json({Success:false, ResultType:'GeneralError', Result: 'missing parameter \'ID_Asset\''});

		restService.select(
			'Ring',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getAssetsSchedules',
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

	asset_schedules: function (req, res) {
		var title = 'Sedinte active - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/asset_schedules/asset_schedules';
		restService.select(
			'Ring',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getAssetsSchedules',
				"objects": [
					{
						"Arguments": {
							"ID_Market":sails.marketId
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

	asset_schedule_add: function (req, res) {
		var title = 'Adaugare sedinta activ - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/asset_schedules/asset_schedule_add';
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
		restService.select(
			'Asset',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'addAssetSchedule',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Asset":req.param('ID_Asset')*1,
								"Code":req.param('Code'),
								"Name":req.param('Name'),
								"PreOpeningTime":req.param('PreOpeningTime'),
								"OpeningTime":req.param('OpeningTime'),
								"PreClosingTime":req.param('PreClosingTime'),
								"ClosingTime":req.param('ClosingTime'),
								"QuantityStepping":req.param('QuantityStepping')!='' ? req.param('QuantityStepping').replace(/\./g,'').replace(',','.')*1 : 'none',
								"MinQuantity":req.param('MinQuantity')!=''? req.param('MinQuantity').replace(/\./g,'').replace(',','.')*1 : 'none',
								"PriceStepping":req.param('PriceStepping')!='' ? req.param('PriceStepping').replace(/\./g,'').replace(',','.')*1 : 'none',
								"MaxPriceVariation":req.param('MaxPriceVariation')!='' ? req.param('MaxPriceVariation').replace(/\./g,'').replace(',','.')*1 : 'none',
								"MinPrice":typeof req.param('MinPrice')!='undefined' && req.param('MinPrice')!='' ? req.param('MinPrice').replace(/\./g,'').replace(',','.')*1 : 'none',
								"MaxPrice":typeof req.param('MaxPrice')!='undefined' && req.param('MaxPrice')!='' ? req.param('MaxPrice').replace(/\./g,'').replace(',','.')*1 : 'none',
								"isActive":(req.param('isActive')=='1'?true:false),
								"isElectronicSession":(req.param('isElectronicSession')=='1'?true:false),
								"launchAutomatically":(req.param('launchAutomatically')=='1'?true:false),
								"StartDate":req.param('StartDate')+'T00:00:00.000',
								"EndDate":req.param('EndDate')+'T00:00:00.000',
								"DeltaT":req.param('DeltaT')*1,
								"DeltaT1":req.param('DeltaT1')*1,
								"DaysOfWeek":{
									"dayMonday":req.param('DaysOfWeek_dayMonday')==1?true:false,
									"dayTuesday":req.param('DaysOfWeek_dayTuesday')==1?true:false,
									"dayWednesday":req.param('DaysOfWeek_dayWednesday')==1?true:false,
									"dayThursday":req.param('DaysOfWeek_dayThursday')==1?true:false,
									"dayFriday":req.param('DaysOfWeek_dayFriday')==1?true:false,
									"daySaturday":req.param('DaysOfWeek_daySaturday')==1?true:false,
									"daySunday":req.param('DaysOfWeek_daySunday')==1?true:false,
								},
								"isDefault":false
							}
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
							req.flash('success','Sedinta activului a fost adaugata cu succes!');
							return res.redirect('/admin/asset_schedules');
						}
					);
				}
			);
		}
		else return res.view(view,{layout:layout, title:title, asset:asset});
	},

	asset_schedule_edit: function (req, res) {
		var title = 'Modificare sedinta activ - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/asset_schedules/asset_schedule_add';
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		if(req.method == 'POST') {
		restService.select(
			'Asset',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'editAssetSchedule',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_AssetSchedule":req.param('id')*1,
								"ID_Asset":req.param('ID_Asset')*1,
								"Code":req.param('Code'),
								"Name":req.param('Name'),
								"PreOpeningTime":req.param('PreOpeningTime'),
								"OpeningTime":req.param('OpeningTime'),
								"PreClosingTime":req.param('PreClosingTime'),
								"ClosingTime":req.param('ClosingTime'),
								"QuantityStepping":req.param('QuantityStepping')!='' ? req.param('QuantityStepping').replace(/\./g,'').replace(',','.')*1 : 'none',
								"MinQuantity":req.param('MinQuantity')!=''? req.param('MinQuantity').replace(/\./g,'').replace(',','.')*1 : 'none',
								"PriceStepping":req.param('PriceStepping')!='' ? req.param('PriceStepping').replace(/\./g,'').replace(',','.')*1 : 'none',
								"MaxPriceVariation":req.param('MaxPriceVariation')!='' ? req.param('MaxPriceVariation').replace(/\./g,'').replace(',','.')*1 : 'none',
								"MinPrice":typeof req.param('MinPrice')!='undefined' && req.param('MinPrice')!='' ? req.param('MinPrice').replace(/\./g,'').replace(',','.')*1 : 'none',
								"MaxPrice":typeof req.param('MaxPrice')!='undefined' && req.param('MaxPrice')!='' ? req.param('MaxPrice').replace(/\./g,'').replace(',','.')*1 : 'none',
								"isActive":(req.param('isActive')=='1'?true:false),
								"isElectronicSession":(req.param('isElectronicSession')=='1'?true:false),
								"launchAutomatically":(req.param('launchAutomatically')=='1'?true:false),
								"StartDate":req.param('StartDate')+'T00:00:00.000',
								"EndDate":req.param('EndDate')+'T00:00:00.000',
								"DeltaT":req.param('DeltaT')*1,
								"DeltaT1":req.param('DeltaT1')*1,
								"DaysOfWeek":{
									"dayMonday":req.param('DaysOfWeek_dayMonday')==1?true:false,
									"dayTuesday":req.param('DaysOfWeek_dayTuesday')==1?true:false,
									"dayWednesday":req.param('DaysOfWeek_dayWednesday')==1?true:false,
									"dayThursday":req.param('DaysOfWeek_dayThursday')==1?true:false,
									"dayFriday":req.param('DaysOfWeek_dayFriday')==1?true:false,
									"daySaturday":req.param('DaysOfWeek_daySaturday')==1?true:false,
									"daySunday":req.param('DaysOfWeek_daySunday')==1?true:false,
								},
								"isDefault":false
							}
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view(view,{layout:layout, title:title, item:req.body});
						},
						function(result){
							req.flash('success','Sedinta activului a fost modificata cu succes!');
							return res.redirect('/admin/asset_schedules');
						}
					);
				}
			);
		}
		else {
		restService.select(
			'Ring',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getAssetsSchedules',
					"objects":[{
						"Arguments":{
							"ID_Market":sails.marketId,
							"ID_AssetSchedule":req.param('id')*1
						}
					}]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view(view,{layout:layout, title:title, item:{}});
						},
						function(result){
							var found_item;
							_.each(result.Rows,function(item){
								if(item.ID==req.param('id')) found_item = item;
							});
							if(!found_item) return res.send(500,'Asset schedule not found!');
							return res.view(view,{layout:layout, title:title, item:found_item});
						}
					);
				}
			);
		}
	},

	schedules: function (req, res) {
		var title = 'Sedinta activ - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/asset_schedules/schedules';
		var asset = null;
		if(req.param('asset')) {
			var asset = req.session.asset;
			if(asset) {
				asset_type = sails.storage.assetTypes[toolsService.searchIdInArray(asset.ID_AssetType,sails.storage.assetTypes)];
				ring = sails.storage.rings[toolsService.searchIdInArray(asset.ID_Ring,sails.storage.rings)];
			}
			else {
				req.flash('error','Activul nu a fost gasit!');;
			}
		}
		if(req.method == 'POST') {
			var moment = require('moment');
			var startDate = moment(req.param('StartDate'),'DD MMM YYYY');
			var endDate = moment(req.param('EndDate'),'DD MMM YYYY');
			var arguments = {
				"ID_Asset":req.param('ID_Asset')*1,
				"PreOpeningTime":req.param('PreOpeningTime') ? req.param('PreOpeningTime') : '00:00:00',
				"OpeningTime":req.param('OpeningTime') ? req.param('OpeningTime') : '00:00:00',
				"PreClosingTime":req.param('PreClosingTime') ? req.param('PreClosingTime') : '00:00:00',
				"ClosingTime":req.param('ClosingTime') ? req.param('ClosingTime') : '00:00:00',
				"isActive":true,
				"isElectronicSession":(req.param('isElectronicSession')=='1'?true:false),
				"launchAutomatically":(req.param('launchAutomatically')=='1'?true:false),
				"StartDate":startDate.format('YYYY-MM-DDTHH:mm:ss.SSS'),
				"EndDate":endDate.format('YYYY-MM-DDTHH:mm:ss.SSS'),
				"DeltaT":req.param('DeltaT')*1,
				"DeltaT1":req.param('DeltaT1')*1,
				"QuantityStepping":req.param('QuantityStepping')!='' ? req.param('QuantityStepping').replace(/\./g,'').replace(',','.')*1 : 'none',
				"MinQuantity":req.param('MinQuantity')!=''? req.param('MinQuantity').replace(/\./g,'').replace(',','.')*1 : 'none',
				"PriceStepping":req.param('PriceStepping')!='' ? req.param('PriceStepping').replace(/\./g,'').replace(',','.')*1 : 'none',
				"MaxPriceVariation":req.param('priceValidation') == 'variation' && req.param('MaxPriceVariation')!='' ? req.param('MaxPriceVariation').replace(/\./g,'').replace(',','.')*1 : 'none',
				"MinPrice":req.param('priceValidation') == 'min-max' && typeof req.param('MinPrice')!='undefined' && req.param('MinPrice')!='' ? req.param('MinPrice').replace(/\./g,'').replace(',','.')*1 : 'none',
				"MaxPrice":req.param('priceValidation') == 'min-max' && typeof req.param('MaxPrice')!='undefined' && req.param('MaxPrice')!='' ? req.param('MaxPrice').replace(/\./g,'').replace(',','.')*1 : 'none',
				"DaysOfWeek":{
					"dayMonday":req.param('DaysOfWeek_dayMonday')==1?true:false,
					"dayTuesday":req.param('DaysOfWeek_dayTuesday')==1?true:false,
					"dayWednesday":req.param('DaysOfWeek_dayWednesday')==1?true:false,
					"dayThursday":req.param('DaysOfWeek_dayThursday')==1?true:false,
					"dayFriday":req.param('DaysOfWeek_dayFriday')==1?true:false,
					"daySaturday":req.param('DaysOfWeek_daySaturday')==1?true:false,
					"daySunday":req.param('DaysOfWeek_daySunday')==1?true:false,
				},
				"isDefault":false
			};
			if(req.param('ID_AssetSchedule')!='') {
				arguments.ID_AssetSchedule = req.param('ID_AssetSchedule')*1;
			}
		restService.select(
			'Asset',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":(req.param('ID_AssetSchedule')!='' ? 'editAssetSchedule' : 'addAssetSchedule'),
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
												return res.redirect('/admin/asset_schedules/schedules?asset='+req.param('ID_Asset'));
												//return res.view(view,{layout:layout, title:title, item:req.body, asset:asset});
											},
											function(result){
												toolsService.parseValidation(result,req);
												return res.redirect('/admin/asset_schedules/schedules?asset='+req.param('ID_Asset'));
												//return res.view(view,{layout:layout, title:title, item:req.body, asset:asset});
											}
										);
									}
								);
							}
							else {
								return res.redirect('/admin/assets/trade_parameters?asset='+req.param('ID_Asset'));
							}
						}
					);
				}
			);
		}
		else {
			var item = {};
			if(ring.PriceStepping) item.PriceStepping = ring.PriceStepping;
			if(ring.QuantityStepping) item.QuantityStepping = ring.QuantityStepping;
			if(ring.MinQuantity) item.MinQuantity = ring.MinQuantity;
			if(ring.MinPrice) item.MinPrice = ring.MinPrice;
			if(ring.MaxPrice) item.MaxPrice = ring.MaxPrice;
			if(ring.MaxPriceVariation) item.MaxPriceVariation = ring.MaxPriceVariation;
			if(ring.hasSchedule) {
				item.PreOpeningTime = ring.PreOpeningTime;
				item.OpeningTime = ring.OpeningTime;
				item.PreClosingTime = ring.PreClosingTime;
				item.ClosingTime = ring.ClosingTime;
				if(ring.StartDate) item.StartDate = ring.StartDate;
				if(ring.EndDate) item.EndDate = ring.EndDate;
			}
		restService.select(
			'Ring',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getAssetsSchedules',
					"objects":[{
						"Arguments":{
							"ID_Market":sails.marketId,
							"ID_Asset":req.param('asset')*1
						}
					}]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view(view,{layout:layout, title:title, item:item});
						},
						function(result){
							if(result.Rows.length>0) {
								return res.view(view,{layout:layout, title:title, asset:asset, item:result.Rows[0]});
							}
							else {
								return res.view(view,{layout:layout, title:title, asset:asset, item:item});
							}
						}
					);
				}
			);
		}
	},

	json: function (req, res) {
		var asset = null;
		if(!req.param('asset')) {
			return res.json({Success:false,ResultType:'GeneralError',Result:'asset id missing!'});
		}
		restService.select(
			'Ring',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getAssetsSchedules',
				"objects":[{
					"Arguments":{
						"ID_Market":sails.marketId,
						"ID_Asset":req.param('asset')*1
					}
				}]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						return res.json(response);
					},
					function(result){
						return res.json(result);
					}
				);
			}
		);
	},

	asset_schedule_delete: function (req, res) {
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		restService.select(
			'Asset',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"procedure":'deleteAssetSchedule',
				"service":'/BRMWrite.svc',
				"objects":[
					{
						"Arguments":{
							"ID_AssetSchedule":req.param('id')*1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.redirect('/admin/asset_schedules');
					},
					function(result){
						req.flash('success','Sedinta activului a fost stearsa cu succes!');
						return res.redirect('/admin/asset_schedules');
					}
				);
			}
		);
	},
	//alex
	all_assetsschedules_json: function (req, res) {
		restService.select(
			'Ring',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getAssetsSchedules',
				"objects":[{
					"Arguments":{
						"ID_Market":sails.marketId
					}
				}]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						return res.json(response);
					},
					function(result){
						return res.json(result);
					}
				);
			}
		);
	}
};
