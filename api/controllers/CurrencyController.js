module.exports = {
  
	currencies: function (req, res) {
		var title = 'Valuta - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/currencies/currencies';
		restService.select(
			'Currency',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getCurrencies'
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
  
  
	currency_add: function (req, res) {
		var title = 'Adaugare valuta - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/currencies/currency_add';
		if(req.method == 'POST') {
		restService.select(
			'Currency',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'addCurrency',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"Code":req.param('Code'),
								"Name_RO":req.param('Name_RO'),
								"Name_EN":req.param('Name_EN')								
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
								req.flash('success','Valuta a fost adaugata cu succes!');
								return res.redirect('/admin/currencies');
							});
						}
					);
				}
			);
		}
		else return res.view(view,{layout:layout, title:title, item:{}});
	},

	currency_edit: function (req, res) {
		var title = 'Modificare valuta - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/currencies/currency_add';
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		if(req.method == 'POST') {
		restService.select(
			'Currency',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'editCurrency',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Currency":req.param('id')*1,
								"Code":req.param('Code'),
								"Name_RO":req.param('Name_RO'),
								"Name_EN":req.param('Name_EN')								
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
								req.flash('success','Valuta a fost modificata cu succes!');
								return res.redirect('/admin/currencies');
							});
						}
					);
				}
			);
		}
		else {
		restService.select(
			'Currency',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getCurrencies',
					"objects":[{
						"Arguments":{
							ID_Currency:req.param('id')*1
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
							var currency;
							_.each(result.Rows,function(item){
								if(item.ID==req.param('id')) currency = item; 
							});
							if(!currency) return res.send(500,'Currency not found!');
							return res.view(view,{layout:layout, title:title, item:currency});
						}
					);
				}
			);
		}
	},

	currency_delete: function (req, res) {
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		restService.select(
			'Currency',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"procedure":'deleteCurrency',
				"service":'/BRMWrite.svc',
				"objects":[
					{
						"Arguments":{
							"ID_Currency":req.param('id')*1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.redirect('/admin/currencies');
					},
					function(result){
						req.flash('success','Valuta a fost stersa cu succes!');
						return res.redirect('/admin/currencies');
					}
				);
			}
		);
	}
};
