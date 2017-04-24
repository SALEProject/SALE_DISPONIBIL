module.exports = {
	index: function (req, res) {
		restService.select(
			'Ring',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getRings',
				"objects": [
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
						for(var i=0;i<result.Rows.length;i++) {
							result.Rows[i].Name = req.session.getTranslation(result.Rows[i].Name);
						}
						return res.json({Success:true, ResultType:'Array', Result: result.Rows});
					}
				);
			}
		);
	},
	
	rings: function (req, res) {
		var title = 'Ringuri - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/rings/rings';
		restService.select(
			'Ring',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getRings',
				"objects":[
					{
						"Arguments":{
							"ID_Market":sails.marketId,
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
						return res.view(view,{layout:layout, title:title, items:[]});
					},
					function(result){
						/*
						var ok = true;
						for(var i=0;i<result.Rows.length;i++) {
							if(!toolsService.hasTranslation(result.Rows[i].Name) || !toolsService.hasTranslation(result.Rows[i].Description)) {
								ok = false;
							}
						}
						if(!ok) {
							eventService.getTranslations(function() {
								return res.view(view,{layout:layout, title:title, items:result.Rows});
							});
						}
						else {
							*/
							return res.view(view,{layout:layout, title:title, items:result.Rows});
						//}
					}
				);
			}
		);
	},

	ring_add: function (req, res) {
		var title = 'Adaugare ring - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/rings/ring_add';
		if(req.method == 'POST') {
			if(req.param('hasSchedule')=='1') {
				var moment = require('moment');
				var startDate = moment(req.param('StartDate'),'DD MMM YYYY');
				var endDate = moment(req.param('EndDate'),'DD MMM YYYY');
				var arguments = {
					"ID_Market":sails.marketId,
					"Code":req.param('Code'),
					"Name_EN":req.param('Name_EN'),
					"Name_RO":req.param('Name_RO'),
					"Description_EN":req.param('Description_EN'),
					"Description_RO":req.param('Description_RO'),
					"isActive":(req.param('isActive')=='1'?true:false),
					"hasSchedule":true,
					"PreOpeningTime":req.param('PreOpeningTime') ? req.param('PreOpeningTime') : '00:00:00',
					"OpeningTime":req.param('OpeningTime') ? req.param('OpeningTime') : '00:00:00',
					"PreClosingTime":req.param('PreClosingTime') ? req.param('PreClosingTime') : '00:00:00',
					"ClosingTime":req.param('ClosingTime') ? req.param('ClosingTime') : '00:00:00',
					"StartDate":startDate.format('YYYY-MM-DDTHH:mm:ss.SSS'),
					"EndDate":endDate.format('YYYY-MM-DDTHH:mm:ss.SSS'),
					"DaysOfWeek":{
						"dayMonday":req.param('DaysOfWeek_dayMonday')==1?true:false,
						"dayTuesday":req.param('DaysOfWeek_dayTuesday')==1?true:false,
						"dayWednesday":req.param('DaysOfWeek_dayWednesday')==1?true:false,
						"dayThursday":req.param('DaysOfWeek_dayThursday')==1?true:false,
						"dayFriday":req.param('DaysOfWeek_dayFriday')==1?true:false,
						"daySaturday":req.param('DaysOfWeek_daySaturday')==1?true:false,
						"daySunday":req.param('DaysOfWeek_daySunday')==1?true:false,
					},
					"QuantityStepping":req.param('QuantityStepping')!='' ? req.param('QuantityStepping').replace(/\./g,'').replace(',','.')*1 : 'none',
					"MinQuantity":req.param('MinQuantity')!=''? req.param('MinQuantity').replace(/\./g,'').replace(',','.')*1 : 'none',
					"PriceStepping":req.param('PriceStepping')!='' ? req.param('PriceStepping').replace(/\./g,'').replace(',','.')*1 : 'none',
					"MaxPriceVariation":req.param('MaxPriceVariation')!='' ? req.param('MaxPriceVariation').replace(/\./g,'').replace(',','.')*1 : 'none',
					"MinPrice":typeof req.param('MinPrice')!='undefined' && req.param('MinPrice')!='' ? req.param('MinPrice').replace(/\./g,'').replace(',','.')*1 : 'none',
					"MaxPrice":typeof req.param('MaxPrice')!='undefined' && req.param('MaxPrice')!='' ? req.param('MaxPrice').replace(/\./g,'').replace(',','.')*1 : 'none',
					"isDefault":false
				};
			}
			else {
				var arguments = {
					"ID_Market":sails.marketId,
					"Code":req.param('Code'),
					"Name_EN":req.param('Name_EN'),
					"Name_RO":req.param('Name_RO'),
					"Description_EN":req.param('Description_EN'),
					"Description_RO":req.param('Description_RO'),
					"isActive":(req.param('isActive')=='1'?true:false),
					"hasSchedule":false,
					"QuantityStepping":req.param('QuantityStepping')!='' ? req.param('QuantityStepping').replace(/\./g,'').replace(',','.')*1 : 'none',
					"MinQuantity":req.param('MinQuantity')!=''? req.param('MinQuantity').replace(/\./g,'').replace(',','.')*1 : 'none',
					"PriceStepping":req.param('PriceStepping')!='' ? req.param('PriceStepping').replace(/\./g,'').replace(',','.')*1 : 'none',
					"MaxPriceVariation":req.param('MaxPriceVariation')!='' ? req.param('MaxPriceVariation').replace(/\./g,'').replace(',','.')*1 : 'none',
					"MinPrice":typeof req.param('MinPrice')!='undefined' && req.param('MinPrice')!='' ? req.param('MinPrice').replace(/\./g,'').replace(',','.')*1 : 'none',
					"MaxPrice":typeof req.param('MaxPrice')!='undefined' && req.param('MaxPrice')!='' ? req.param('MaxPrice').replace(/\./g,'').replace(',','.')*1 : 'none',
					"isDefault":false
				};
			}
		restService.select(
			'Ring',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'addRing',
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
							return res.view(view,{layout:layout, title:title, item:req.body});
						},
						function(result){
							//var sleep = require('sleep');
							//sleep.sleep(1);
							eventService.getTranslations(function() {
								req.flash('success','Ringul a fost adaugat cu succes!');
								if(typeof result == 'object' && typeof result.ID_Ring != 'undefined') {
									return res.redirect('/admin/rings/edit/'+result.ID_Ring);
								}
								else {
									return res.redirect('/admin/rings');
								}
							});
						}
					);
				}
			);
		}
		else return res.view(view,{layout:layout, title:title, item:{}});
	},

	ring_edit: function (req, res) {
		var title = 'Modificare ring - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/rings/ring_add';
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		if(req.method == 'POST') {
			if(req.param('hasSchedule')=='1') {
				var moment = require('moment');
				var startDate = moment(req.param('StartDate'),'DD MMM YYYY');
				var endDate = moment(req.param('EndDate'),'DD MMM YYYY');
				var arguments = {
					"ID_Ring":req.param('id')*1,
					"ID_Market":sails.marketId,
					"Code":req.param('Code'),
					"Name_EN":req.param('Name_EN'),
					"Name_RO":req.param('Name_RO'),
					"Description_EN":req.param('Description_EN'),
					"Description_RO":req.param('Description_RO'),
					"isActive":(req.param('isActive')=='1'?true:false),
					"hasSchedule":true,
					"PreOpeningTime":req.param('PreOpeningTime'),
					"OpeningTime":req.param('OpeningTime'),
					"PreClosingTime":req.param('PreClosingTime'),
					"ClosingTime":req.param('ClosingTime'),
					"StartDate":startDate.format('YYYY-MM-DDTHH:mm:ss.SSS'),
					"EndDate":endDate.format('YYYY-MM-DDTHH:mm:ss.SSS'),
					"DaysOfWeek":{
						"dayMonday":req.param('DaysOfWeek_dayMonday')==1?true:false,
						"dayTuesday":req.param('DaysOfWeek_dayTuesday')==1?true:false,
						"dayWednesday":req.param('DaysOfWeek_dayWednesday')==1?true:false,
						"dayThursday":req.param('DaysOfWeek_dayThursday')==1?true:false,
						"dayFriday":req.param('DaysOfWeek_dayFriday')==1?true:false,
						"daySaturday":req.param('DaysOfWeek_daySaturday')==1?true:false,
						"daySunday":req.param('DaysOfWeek_daySunday')==1?true:false,
					},
					"QuantityStepping":req.param('QuantityStepping')!='' ? req.param('QuantityStepping').replace(/\./g,'').replace(',','.')*1 : 'none',
					"MinQuantity":req.param('MinQuantity')!=''? req.param('MinQuantity').replace(/\./g,'').replace(',','.')*1 : 'none',
					"PriceStepping":req.param('PriceStepping')!='' ? req.param('PriceStepping').replace(/\./g,'').replace(',','.')*1 : 'none',
					"MaxPriceVariation":req.param('MaxPriceVariation')!='' ? req.param('MaxPriceVariation').replace(/\./g,'').replace(',','.')*1 : 'none',
					"MinPrice":typeof req.param('MinPrice')!='undefined' && req.param('MinPrice')!='' ? req.param('MinPrice').replace(/\./g,'').replace(',','.')*1 : 'none',
					"MaxPrice":typeof req.param('MaxPrice')!='undefined' && req.param('MaxPrice')!='' ? req.param('MaxPrice').replace(/\./g,'').replace(',','.')*1 : 'none',
					"isDefault":false
				};
			}
			else {
				var arguments = {
					"ID_Ring":req.param('id')*1,
					"ID_Market":sails.marketId,
					"Code":req.param('Code'),
					"Name_EN":req.param('Name_EN'),
					"Name_RO":req.param('Name_RO'),
					"Description_EN":req.param('Description_EN'),
					"Description_RO":req.param('Description_RO'),
					"isActive":(req.param('isActive')=='1'?true:false),
					"hasSchedule":false,
					"QuantityStepping":req.param('QuantityStepping')!='' ? req.param('QuantityStepping').replace(/\./g,'').replace(',','.')*1 : 'none',
					"MinQuantity":req.param('MinQuantity')!=''? req.param('MinQuantity').replace(/\./g,'').replace(',','.')*1 : 'none',
					"PriceStepping":req.param('PriceStepping')!='' ? req.param('PriceStepping').replace(/\./g,'').replace(',','.')*1 : 'none',
					"MaxPriceVariation":req.param('MaxPriceVariation')!='' ? req.param('MaxPriceVariation').replace(/\./g,'').replace(',','.')*1 : 'none',
					"MinPrice":typeof req.param('MinPrice')!='undefined' && req.param('MinPrice')!='' ? req.param('MinPrice').replace(/\./g,'').replace(',','.')*1 : 'none',
					"MaxPrice":typeof req.param('MaxPrice')!='undefined' && req.param('MaxPrice')!='' ? req.param('MaxPrice').replace(/\./g,'').replace(',','.')*1 : 'none',
					"isDefault":false
				};
			}
		restService.select(
			'Ring',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'editRing',
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
							return res.view(view,{layout:layout, title:title, item:req.body});
						},
						function(result){
							//var sleep = require('sleep');
							//sleep.sleep(1);
							eventService.getTranslations(function() {
								req.flash('success','Ringul a fost modificat cu succes!');
								return res.redirect('/admin/rings');
							});
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
					"currentState":'dashboard',
					"method":'select',
					"procedure":'getRings',
					"objects":[
						{
							"Arguments":{
								"ID_Market":sails.marketId,
								"ID_Ring":req.param("id")*1,
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
							return res.view(view,{layout:layout, title:title, item:{}});
						},
						function(result){
							var found_item;
							_.each(result.Rows,function(item){
								if(item.ID==req.param('id')) found_item = item; 
							});
							if(!found_item) return res.send(500,'Ring not found!');
							return res.view(view,{layout:layout, title:title, item:found_item});
						}
					);
				}
			);
		}
	},

	ring_delete: function (req, res) {
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		restService.select(
			'Ring',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"procedure":'deleteRing',
				"service":'/BRMWrite.svc',
				"objects":[
					{
						"Arguments":{
							"ID_Market":sails.marketId,
							"ID_Ring":req.param('id')*1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.redirect('/admin/rings');
					},
					function(result){
						req.flash('success','Ringul a fost sters cu succes!');
						return res.redirect('/admin/rings');
					}
				);
			}
		);
	},

	setClient2Ring: function (req,res) {
		if(!req.param('ring_id')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'ring_id\''});
		if(!req.param('client_id')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'client_id\''});
		if(!req.param('canBuy')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'canBuy\''});
		if(!req.param('canSell')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'canSell\''});
		if(req.method == 'POST') {
		restService.select(
			'Ring',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":"setClient2Ring",
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Market":sails.marketId,
								"ID_Ring": req.param('ring_id')*1,
								"ID_Client": req.param('client_id')*1,
								"canBuy": (req.param('canBuy')=='true'?true:false),
								"canSell": (req.param('canSell')=='true'?true:false)
							}
						}
					]
				},
				function(error,result) {				  
				  if (error) {				  	
					if(error.hasOwnProperty('name') && error.name=='ConnectTimeoutError') message = 'Connection timeout. Please try again later.';
					else message = error;
					return res.json({Success:false,ResultType:'GeneralError',Result:message});
				  } else {
					toolsService.parseResponse(result,function(msg) {
						return res.json(result);
					},
					function(resultObject) {
						return res.json({Success:true});
					});
				  }
			});
		}
		else return res.json({Success:false,ResultType:'GeneralError',Result:'no post data!'});
	},

	setWarrantyType2Ring: function (req,res) {
		if(!req.param('ring_id')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'ring_id\''});
		if(!req.param('warrantytype_id')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'warrantytype_id\''});
		if(!req.param('isSet')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'isSet\''});
		if(req.method == 'POST') {
		restService.select(
			'Ring',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":"setWarrantyType2Ring",
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Ring": req.param('ring_id')*1,
								"ID_WarrantyType": req.param('warrantytype_id')*1,
								"isDeleted": (req.param('isSet')=='true'?false:true),
							}
						}
					]
				},
				function(error,result) {				  
				  if (error) {				  	
					if(error.hasOwnProperty('name') && error.name=='ConnectTimeoutError') message = 'Connection timeout. Please try again later.';
					else message = error;
					return res.json({Success:false,ResultType:'GeneralError',Result:message});
				  } else {
					toolsService.parseResponse(result,function(msg) {
						return res.json(result);
					},
					function(resultObject) {
						return res.json({Success:true});
					});
				  }
			});
		}
		else return res.json({Success:false,ResultType:'GeneralError',Result:'no post data!'});
	},

	setWarrantyType2RingPriority: function (req,res) {
		if(!req.param('ID_Ring')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'ID_Ring\''});
		if(!req.param('ID_WarrantyType')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'ID_WarrantyType\''});
		if(!req.param('Offset')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'Offset\''});
		//if(req.method == 'POST') {
			if((req.method == 'POST') || (req.method == 'GET')) {
		restService.select(
			'Ring',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":"setWarrantyTypePriority",
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Ring": req.param('ID_Ring')*1,
								"ID_WarrantyType": req.param('ID_WarrantyType')*1,
								"Offset": req.param('Offset')*1
							}
						}
					]
				},
				function(error,result) {				  
				  if (error) {				  	
					if(error.hasOwnProperty('name') && error.name=='ConnectTimeoutError') message = 'Connection timeout. Please try again later.';
					else message = error;
					return res.json({Success:false,ResultType:'GeneralError',Result:message});
				  } else {
					toolsService.parseResponse(result,function(msg) {
						return res.json(result);
					},
					function(resultObject) {
						return res.json({Success:true});
					});
				  }
			});
		}
		else return res.json({Success:false,ResultType:'GeneralError',Result:'no post data!'});
	},

	setRingAdministrator: function (req,res) {
		if(!req.param('ID_Ring')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'ring_id\''});
		if(!req.param('ID_User')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'user_id\''});
		if(!req.param('isAllowed')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'isAllowed\''});
		if(req.method == 'POST') {
		restService.select(
			'Ring',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure": req.param('isAllowed')=='true' ? "setRingAdministrator" : "resetRingAdministrator",
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Market":sails.marketId,
								"ID_Ring": req.param('ID_Ring')*1,
								"ID_User": req.param('ID_User')*1
							}
						}
					]
				},
				function(error,result) {				  
				  if (error) {				  	
					if(error.hasOwnProperty('name') && error.name=='ConnectTimeoutError') message = 'Connection timeout. Please try again later.';
					else message = error;
					return res.json({Success:false,ResultType:'GeneralError',Result:message});
				  } else {
					toolsService.parseResponse(result,function(msg) {
						return res.json(result);
					},
					function(resultObject) {
						return res.json({Success:true});
					});
				  }
			});
		}
		else return res.json({Success:false,ResultType:'GeneralError',Result:'no post data!'});
	},

	setClient2Asset: function (req,res) {
		if(!req.param('asset_id')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'asset_id\''});
		if(!req.param('client_id')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'client_id\''});
		if(!req.param('canBuy')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'canBuy\''});
		if(!req.param('canSell')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'canSell\''});
		if(req.method == 'POST') {
		restService.select(
			'Ring',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":"setClient2Asset",
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Market":sails.marketId,
								"ID_Asset": req.param('asset_id')*1,
								"ID_Client": req.param('client_id')*1,
								"canBuy": (req.param('canBuy')=='true'?true:false),
								"canSell": (req.param('canSell')=='true'?true:false)
							}
						}
					]
				},
				function(error,result) {				  
				  if (error) {				  	
					if(error.hasOwnProperty('name') && error.name=='ConnectTimeoutError') message = 'Connection timeout. Please try again later.';
					else message = error;
					return res.json({Success:false,ResultType:'GeneralError',Result:message});
				  } else {
					toolsService.parseResponse(result,function(msg) {
						return res.json(result);
					},
					function(resultObject) {
						return res.json({Success:true});
					});
				  }
			});
		}
		else return res.json({Success:false,ResultType:'GeneralError',Result:'no post data!'});
	},
	//alex
	asset_clients_json: function (req, res) {
		/*if(req.param('asset')) {
			if(asset <= 0) {
				req.flash('error','Activul nu a fost gasit!');;
			}
		}
		var item = {};*/
		restService.select(
			'Ring',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getAssetClients',
				"objects":[
					{
						"Arguments":{
							"ID_Asset":req.param('asset')*1
						}
					}
				]
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

