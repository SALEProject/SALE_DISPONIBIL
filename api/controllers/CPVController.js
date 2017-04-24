module.exports = {
  
	cpvs: function (req, res) {
		var title = 'CPV - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/cpvs/cpvs';
		restService.select(
			'Nomenclator',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getCPVS'
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
  
	cpv_add: function (req, res) {
		var title = 'Adaugare CPV - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/cpvs/cpv_add';
		if(req.method == 'POST') {
		restService.select(
			'Nomenclator',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'addCPV',
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
							eventService.getTranslations(function() {
								req.flash('success','Codul CPV a fost adaugat cu succes!');
								return res.redirect('/admin/cpvs');
							});
						}
					);
				}
			);
		}
		else return res.view(view,{layout:layout, title:title, item:{}});
	},

	cpv_edit: function (req, res) {
		var title = 'Modificare CPV - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/cpvs/cpv_add';
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		if(req.method == 'POST') {
		restService.select(
			'Nomenclator',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'editCPV',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_CPV":req.param('id')*1,
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
							eventService.getTranslations(function() {
								req.flash('success','Codul CPV a fost modificat cu succes!');
								return res.redirect('/admin/cpvs');
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
					"procedure":'getCPVS',
					"objects":[{
						"Arguments":{
							ID_CPV:req.param('id')*1
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
							var cpv;
							_.each(result.Rows,function(item){
								if(item.ID==req.param('id')) cpv = item; 
							});
							if(!cpv) return res.send(500,'CPV not found!');
							return res.view(view,{layout:layout, title:title, item:cpv});
						}
					);
				}
			);
		}
	},

	cpv_delete: function (req, res) {
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		restService.select(
			'Nomenclator',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"procedure":'deleteCPV',
				"service":'/BRMWrite.svc',
				"objects":[
					{
						"Arguments":{
							"ID_CPV":req.param('id')*1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.redirect('/admin/cpvs');
					},
					function(result){
						req.flash('success','Codul CPV a fost sters cu succes!');
						return res.redirect('/admin/cpvs');
					}
				);
			}
		);
	}
};
