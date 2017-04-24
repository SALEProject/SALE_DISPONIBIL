module.exports = {

	index: function (req, res) {
		if(!req.param('ID_Ring')) return res.json({Success:false, ResultType:'GeneralError', Result: 'missing parameter \'ID_Ring\''});
		restService.select(
			'AssetType',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getAssetTypes',
				"objects": [
					{
						"Arguments": {
							"ID_Market": sails.config.marketId,
							"ID_Ring": req.param('ID_Ring')*1,
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
						return res.json({Success:true, ResultType:'Array', Result: result.Rows});
					}
				);
			}
		);
	},

	asset_types: function (req, res) {
		var title = 'Active suport - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/asset_types/asset_types';
		restService.select(
			'AssetType',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getAssetTypes',
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

	asset_type_add: function (req, res) {
		var title = 'Adaugare activ suport - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/asset_types/asset_type_add';
		var ring = null;
		if(req.param('ring')) {
			ring = toolsService.getArrayItem(sails.storage.rings,req.param('ring')*1);
		}
		if(req.method == 'POST') {
			var arguments = {
								"ID_Market":sails.marketId,
								"ID_Ring":req.param('ID_Ring')*1,
								"Code":req.param('Code'),
								"Name_RO":req.param('Name_RO'),
								"Name_EN":req.param('Name_EN'),
								"Description_RO":req.param('Description_RO'),
								"Description_EN":req.param('Description_EN'),
								"ID_MeasuringUnit":req.param('ID_MeasuringUnit')*1,
								"ID_Currency":req.param('ID_Currency')*1,
								"isDefault":false
							};
			for(var i =0;i<req.session.params.length;i++) {
				arguments[req.session.params[i].label] = (req.param(req.session.params[i].label)=='1'?true:false);
			}
		restService.select(
			'AssetType',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'addAssetType',
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
							return res.view(view,{layout:layout, title:title, item:req.body, ring: ring});
						},
						function(result){
							//var sleep = require('sleep');
							//sleep.sleep(1);
							eventService.getTranslations(function() {
								req.flash('success','Activul suport a fost adaugat cu succes!');
								if(req.param('ring')) {
									return res.redirect('/admin/rings/edit/'+req.param('ring')+'#tab-assetTypes');
								}
								else {
									return res.redirect('/admin/asset_types');
								}
							});
						}
					);
				}
			);
		}
		else return res.view(view,{layout:layout, title:title, item:{}, ring: ring});
	},

	asset_type_edit: function (req, res) {
		var title = 'Modificare activ suport - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/asset_types/asset_type_add';
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		var ring = null;
		if(req.param('ring')) {
			ring = toolsService.getArrayItem(sails.storage.rings,req.param('ring')*1);
		}
		if(req.method == 'POST') {
			var arguments = {
								"ID_AssetType":req.param('id')*1,
								"ID_Market":sails.marketId,
								"ID_Ring":req.param('ID_Ring')*1,
								"Code":req.param('Code'),
								"Name_RO":req.param('Name_RO'),
								"Name_EN":req.param('Name_EN'),
								"Description_RO":req.param('Description_RO'),
								"Description_EN":req.param('Description_EN'),
								"ID_MeasuringUnit":req.param('ID_MeasuringUnit')*1,
								"ID_Currency":req.param('ID_Currency')*1,
								"isDefault":false
							};
			for(var i =0;i<req.session.params.length;i++) {
				arguments[req.session.params[i].label] = (req.param(req.session.params[i].label)=='1'?true:false);
			}
		restService.select(
			'AssetType',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'editAssetType',
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
							return res.view(view,{layout:layout, title:title, item:req.body, ring: ring});
						},
						function(result){
							//var sleep = require('sleep');
							//sleep.sleep(1);
							eventService.getTranslations(function() {
								req.flash('success','Activul suport a fost modificat cu succes!');
								if(req.param('ring')) {
									return res.redirect('/admin/rings/edit/'+req.param('ring')+'#tab-assetTypes');
								}
								else {
									return res.redirect('/admin/asset_types');
								}
							});
						}
					);
				}
			);
		}
		else {
		restService.select(
			'AssetType',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getAssetTypes',
					"objects":[{
						"Arguments":{
							"ID_Market":sails.marketId,
							"ID_AssetType":req.param('id')*1
						}
					}]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view(view,{layout:layout, title:title, item:{}, ring: ring});
						},
						function(result){
							var asset_type;
							_.each(result.Rows,function(item){
								if(item.ID==req.param('id')) asset_type = item;
							});
							if(!asset_type) return res.send(500,'Asset type not found!');
							return res.view(view,{layout:layout, title:title, item:asset_type, ring: ring});
						}
					);
				}
			);
		}
	},

	asset_type_delete: function (req, res) {
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		restService.select(
			'AssetType',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"procedure":'deleteAssetType',
				"service":'/BRMWrite.svc',
				"objects":[
					{
						"Arguments":{
							"ID_AssetType":req.param('id')*1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
							if(req.param('ring')) {
								return res.redirect('/admin/rings/edit/'+req.param('ring')+'#tab-assetTypes');
							}
							else {
								return res.redirect('/admin/asset_types');
							}
					},
					function(result){
						req.flash('success','Activul suport a fost sters cu succes!');
							if(req.param('ring')) {
								return res.redirect('/admin/rings/edit/'+req.param('ring')+'#tab-assetTypes');
							}
							else {
								return res.redirect('/admin/asset_types');
							}
					}
				);
			}
		);
	}
};
