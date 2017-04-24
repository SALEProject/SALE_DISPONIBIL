module.exports = {
  
	terminals: function (req, res) {
		var title = 'TERMINAL - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/terminals/terminals';
		restService.select(
			'Nomenclator',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getTerminals',
				"objects":[
						{
							"Arguments":
							{
								"all": true
							}
						}
					]
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
  
	terminal_add: function (req, res) {
		var title = 'Adaugare Terminal - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/terminals/terminal_add';
		if(req.method == 'POST') {
		restService.select(
			'Nomenclator',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'addTerminal',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"Code":req.param('Code'),
								"Name":req.param('Name'),
								"Administrator":req.param('Administrator'),
								"isActive":(req.param('isActive')=='1'?true:false),
								"Chairman":req.param('Chairman'),
								"CEO":req.param('CEO'),
								"Email":req.param('Email'),
								"Phone":req.param('Phone'),
								"Fax":req.param('Fax'),
								"Website":req.param('Website'),
								"StreetAddress":req.param('StreetAddress'),
								"City":req.param('City'),
								"ID_County":req.param('ID_County')*1,
								"PostalCode":req.param('PostalCode')								
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
							req.flash('success','Terminalul a fost adaugat cu succes!');
							return res.redirect('/admin/terminals');
						}
					);
				}
			);
		}
		else return res.view(view,{layout:layout, title:title, item:{}});
	},

	terminal_edit: function (req, res) {
		var title = 'Modificare Terminal - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/terminals/terminal_add';
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		if(req.method == 'POST') {
		restService.select(
			'Nomenclator',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'editTerminal',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Terminal":req.param('id')*1,
								"Code":req.param('Code'),
								"Name":req.param('Name'),
								"Administrator":req.param('Administrator'),
								"isActive":(req.param('isActive')=='1'?true:false),
								"Chairman":req.param('Chairman'),
								"CEO":req.param('CEO'),
								"Email":req.param('Email'),
								"Phone":req.param('Phone'),
								"Fax":req.param('Fax'),
								"Website":req.param('Website'),
								"StreetAddress":req.param('StreetAddress'),
								"City":req.param('City'),
								"ID_County":req.param('ID_County')*1,
								"PostalCode":req.param('PostalCode')	
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
							req.flash('success','Terminalul a fost modificat cu succes!');
							return res.redirect('/admin/terminals');
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
					"procedure":'getTerminals',
					"objects":[{
						"Arguments":{
							ID_Terminal:req.param('id')*1
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
							var terminal;
							_.each(result.Rows,function(item){
								if(item.ID==req.param('id')) terminal = item; 
							});
							if(!terminal) return res.send(500,'CPV not found!');
							return res.view(view,{layout:layout, title:title, item:terminal});
						}
					);
				}
			);
		}
	},

	terminal_delete: function (req, res) {
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		restService.select(
			'Nomenclator',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"procedure":'deleteTerminal',
				"service":'/BRMWrite.svc',
				"objects":[
					{
						"Arguments":{
							"ID_Terminal":req.param('id')*1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.redirect('/admin/terminals');
					},
					function(result){
						req.flash('success','Terminalul a fost sters cu succes!');
						return res.redirect('/admin/terminals');
					}
				);
			}
		);
	}
};
