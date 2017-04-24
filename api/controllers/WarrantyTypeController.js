module.exports = {

	warranty_types: function (req, res) {
		var title = 'Tip Garantie - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/warranty_types/warranty_types';
		restService.select(
			'Warranty',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getWarrantyTypes'
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error', err);
						return res.view(view,{layout:layout, title:title, items:[]});
					},
					function(result){
						return res.view(view,{layout:layout, title:title, items:result.Rows});
					}
				);
			}
		);
	},
  
  
	warranty_type_add: function (req, res) {
		var title = 'Adaugare tip garantie - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/warranty_types/warranty_type_add';
		if(req.method == 'POST') {
		restService.select(
			'Warranty',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'addWarrantyType',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"Code":req.param('Code'),
								"Name_RO":req.param('Name_RO'),
								"Name_EN":req.param('Name_EN'),
								"isValid":(req.param('isValid')=='1'?true:false),
								"isAvailable4Period":(req.param('isAvailable4Period')=='1'?true:false),
								"isAvailable4Asset":(req.param('isAvailable4Asset')=='1'?true:false)														
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
							//var sleep = require('sleep');
							//sleep.sleep(1);
							eventService.getTranslations(function() {
								req.flash('success','Tipul de garantie a fost adaugat cu succes!');
								return res.redirect('/admin/warranty_types');
							});
						}
					);
				}
			);
		}
		else return res.view(view,{layout:layout, title:title, item:{}});
	},

	warranty_type_edit: function (req, res) {
		var title = 'Modificare tip garantie - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/warranty_types/warranty_type_add';
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		if(req.method == 'POST') {
		restService.select(
			'Warranty',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'editWarrantyType',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_WarrantyType":req.param('id')*1,
								"Code":req.param('Code'),
								"Name_RO":req.param('Name_RO'),
								"Name_EN":req.param('Name_EN'),
								"isValid":(req.param('isValid')=='1'?true:false),
								"isAvailable4Period":(req.param('isAvailable4Period')=='1'?true:false),
								"isAvailable4Asset":(req.param('isAvailable4Asset')=='1'?true:false)							
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
							//var sleep = require('sleep');
							//sleep.sleep(1);
							eventService.getTranslations(function() {
								req.flash('success','Tipul de garantie a fost modificat cu succes!');
								return res.redirect('/admin/warranty_types');
							});
						}
					);
				}
			);
		}
		else {
		restService.select(
			'Warranty',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getWarrantyTypes',
					"objects":[{
						"Arguments":{
							ID_WarrantyType:req.param('id')*1
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
							var warrantyType;
							_.each(result.Rows,function(item){
								if(item.ID==req.param('id')) warrantyType = item; 
							});
							if(!warrantyType) return res.send(500,'Document type not found!');
							return res.view(view,{layout:layout, title:title, item:warrantyType});
						}
					);
				}
			);
		}
	},

	warranty_type_delete: function (req, res) {
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		restService.select(
			'Warranty',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"procedure":'deleteWarrantyType',
				"service":'/BRMWrite.svc',
				"objects":[
					{
						"Arguments":{
							"ID_WarrantyType":req.param('id')*1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.redirect('/admin/warranty_types');
					},
					function(result){
						req.flash('success','Tipul de garantie a fost sters cu succes!');
						return res.redirect('/admin/warranty_types');
					}
				);
			}
		);
	}
};
