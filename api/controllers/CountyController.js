module.exports = {

	counties: function (req, res) {
		var title = 'Judete - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/counties/counties';
		restService.select(
			'County',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getCounties'
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
  
  
	county_add: function (req, res) {
		var title = 'Adaugare Judet - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/counties/county_add';
		if(req.method == 'POST') {
		restService.select(
			'County',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'addCounty',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Country" : 1,
								"Code":req.param('Code'),
								"Name":req.param('Name')
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
							req.flash('success','Judetul a fost adaugat cu succes!');
							return res.redirect('/admin/counties');
						}
					);
				}
			);
		}
		else return res.view(view,{layout:layout, title:title, item:{}});
	},

	county_edit: function (req, res) {
		var title = 'Modificare Judet - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/counties/county_add';
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		if(req.method == 'POST') {
		restService.select(
			'County',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'editCounty',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Country" : 1,
								"ID_County":req.param('id')*1,
								"Code":req.param('Code'),
								"Name":req.param('Name')
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
							req.flash('success','Judetul a fost modificat cu succes!');
							return res.redirect('/admin/counties');
						}
					);
				}
			);
		}
		else {
		restService.select(
			'County',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getCounties',
					"objects":[{
						"Arguments":{
							ID_County:req.param('id')*1
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
							var county;
							_.each(result.Rows,function(item){
								if(item.ID==req.param('id')) county = item; 
							});
							if(!county) return res.send(500,'Judetul nu a fost gasit!');
							return res.view(view,{layout:layout, title:title, item:county});
						}
					);
				}
			);
		}
	},

	county_delete: function (req, res) {
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		restService.select(
			'County',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"procedure":'deleteCounty',
				"service":'/BRMWrite.svc',
				"objects":[
					{
						"Arguments":{
							"ID_County":req.param('id')*1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.redirect('/admin/counties');
					},
					function(result){
						req.flash('success','Judetul a fost sters cu succes!');
						return res.redirect('/admin/counties');
					}
				);
			}
		);
	}
};
