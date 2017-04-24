module.exports = {
  
	measuring_units: function (req, res) {
		var title = 'Unitate de masura - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/measuring_units/measuring_units';
		restService.select(
			'MeasuringUnit',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getMeasuringUnits'
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
  
  
	measuring_unit_add: function (req, res) {
		var title = 'Adaugare unitate de masura - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/measuring_units/measuring_unit_add';
		if(req.method == 'POST') {
		restService.select(
			'MeasuringUnit',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'addMeasuringUnit',
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
								req.flash('success','Unitatea de masura a fost adaugata cu succes!');
								return res.redirect('/admin/measuring_units');
							});
						}
					);
				}
			);
		}
		else return res.view(view,{layout:layout, title:title, item:{}});
	},

	measuring_unit_edit: function (req, res) {
		var title = 'Modificare unitate de masura - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/measuring_units/measuring_unit_add';
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		if(req.method == 'POST') {
		restService.select(
			'MeasuringUnit',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'editMeasuringUnit',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_MeasuringUnit":req.param('id')*1,
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
								req.flash('success','Unitatea de masura a fost modificata cu succes!');
								return res.redirect('/admin/measuring_units');
							});
						}
					);
				}
			);
		}
		else {
		restService.select(
			'MeasuringUnit',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getMeasuringUnits',
					"objects":[{
						"Arguments":{
							ID_MeasuringUnit:req.param('id')*1
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
							var measuringUnit;
							_.each(result.Rows,function(item){
								if(item.ID==req.param('id')) measuringUnit = item; 
							});
							if(!measuringUnit) return res.send(500,'Measuring unit not found!');
							return res.view(view,{layout:layout, title:title, item:measuringUnit});
						}
					);
				}
			);
		}
	},

	measuring_unit_delete: function (req, res) {
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		restService.select(
			'MeasuringUnit',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"procedure":'deleteMeasuringUnit',
				"service":'/BRMWrite.svc',
				"objects":[
					{
						"Arguments":{
							"ID_MeasuringUnit":req.param('id')*1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.redirect('/admin/measuring_units');
					},
					function(result){
						req.flash('success','Unitatea de masura a fost stersa cu succes!');
						return res.redirect('/admin/measuring_units');
					}
				);
			}
		);
	}
};
