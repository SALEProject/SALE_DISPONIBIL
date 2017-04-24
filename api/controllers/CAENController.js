module.exports = {
  
	caens: function (req, res) {
		var title = 'CAEN - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/caens/caens';
		restService.select(
			'Nomenclator',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getCAENS'
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
  
	caen_add: function (req, res) {
		var title = 'Adaugare CAEN - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/caens/caen_add';
		if(req.method == 'POST') {
		restService.select(
			'Nomenclator',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'addCAEN',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"Code":req.param('Code'),
								"Name_RO":req.param('Name_RO'),
								"Name_EN":req.param('Name_EN'),
								"ParentCode":req.param('ParentCode'),
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
							eventService.getTranslations(function() {
								req.flash('success','Codul CAEN a fost adaugat cu succes!');
								return res.redirect('/admin/caens');
							});
						}
					);
				}
			);
		}
		else return res.view(view,{layout:layout, title:title, item:{}});
	},

	caen_edit: function (req, res) {
		var title = 'Modificare CAEN - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/caens/caen_add';
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		if(req.method == 'POST') {
		restService.select(
			'Nomenclator',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'editCAEN',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_CAEN":req.param('id')*1,
								"Code":req.param('Code'),
								"Name_RO":req.param('Name_RO'),								
								"Name_EN":req.param('Name_EN'),
								"ParentCode":req.param('ParentCode')
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
							eventService.getTranslations(function() {
								req.flash('success','Codul CAEN a fost modificat cu succes!');
								return res.redirect('/admin/caen');
							});
						}
					);
				}
			);
		}
		else {
		restService.select(
			'Nomenclator',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getCAENS',
					"objects":[{
						"Arguments":{
							ID_CAEN:req.param('id')*1
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
							var caen;
							_.each(result.Rows,function(item){
								if(item.ID==req.param('id')) caen = item; 
							});
							if(!caen) return res.send(500,'CAEN not found!');
							return res.view(view,{layout:layout, title:title, item:caen});
						}
					);
				}
			);
		}
	},

	caen_delete: function (req, res) {
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		restService.select(
			'Nomenclator',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"procedure":'deleteCAEN',
				"service":'/BRMWrite.svc',
				"objects":[
					{
						"Arguments":{
							"ID_CAEN":req.param('id')*1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.redirect('/admin/caens');
					},
					function(result){
						req.flash('success','Codul CAEN a fost sters cu succes!');
						return res.redirect('/admin/caens');
					}
				);
			}
		);
	}
};
