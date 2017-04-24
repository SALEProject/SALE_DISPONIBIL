module.exports = {

	broker_add: function (req, res) {
		var title = 'Adaugare broker - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/brokers/broker_add';
		var agency = toolsService.getArrayItem(req.session.agencies,req.param('agency')*1);
		if(!agency) {
			return res.send(500,'Agency not found!');
		}
		if(req.method == 'POST') {
			var arguments = {
				"LoginName":req.param('LoginName'),
				"LoginPassword":req.param('LoginPassword'),
				"Email":req.param('Email'),
				"Phone":req.param('Phone'),
				"Fax":req.param('Fax'),
				"Mobile":req.param('Mobile'),
				"FirstName":req.param('FirstName'),
				"LastName":req.param('LastName'),
				"ID_Agency":req.param('agency')*1,
				"SocialCode":req.param('SocialCode'),
				"IdentityCard":req.param('IdentityCard'),
				"ID_UserRole": [9] // Broker role
			};
		restService.select(
			'Login',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'adduser',
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
							return res.view(view,{layout:layout, title:title, item:req.body, agency:agency});
						},
						function(result){
							req.flash('success','Brokerul a fost adaugat cu succes!');
							return res.redirect('/admin/agencies/edit/'+req.param('agency')+'#tab-brokers');
						}
					);
				}
			);
		}
		else return res.view(view,{layout:layout, title:title, item:{}, agency:agency});
	},

	broker_edit: function (req, res) {
		var title = 'Modificare broker - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/brokers/broker_add';
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		var agency = toolsService.getArrayItem(req.session.agencies,req.param('agency')*1);
		if(!agency) {
			return res.send(500,'Agency not found!');
		}
		if(req.method == 'POST') {
			var arguments = {
				"ID_Broker":req.param('id')*1,
				"LoginName":req.param('LoginName'),
				"LoginPassword":req.param('LoginPassword'),
				"Email":req.param('Email'),
				"Phone":req.param('Phone'),
				"Fax":req.param('Fax'),
				"Mobile":req.param('Mobile'),
				"FirstName":req.param('FirstName'),
				"LastName":req.param('LastName'),
				"ID_Agency":req.param('agency')*1,
				"SocialCode":req.param('SocialCode'),
				"IdentityCard":req.param('IdentityCard'),
				"ID_UserRole":[9] // Broker role
			};
		restService.select(
			'Login',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'edituser',
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
							return res.view(view,{layout:layout, title:title, item:req.body, agency:agency});
						},
						function(result){
							var sleep = require('sleep');
							sleep.sleep(1);
							req.flash('success','Brokerul a fost modificat cu succes!');
							return res.redirect('/admin/agencies/edit/'+req.param('agency')+'#tab-brokers');
						}
					);
				}
			);
		}
		else {
		restService.select(
			'Agency',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getContacts',
					"objects":[{
						"Arguments":{
							"ID_Agency":req.param('agency')*1,
							"ID_Contact":req.param('id')*1
						}
					}]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view(view,{layout:layout, title:title, item:{}, agency:agency});
						},
						function(result){
							var contact;
							_.each(result.Rows,function(item){
								if(item.ID==req.param('id')) contact = item; 
							});
							if(!contact) return res.send(500,'Broker not found!');
							return res.view(view,{layout:layout, title:title, item:contact, agency:agency});
						}
					);
				}
			);
		}
	},

	broker_delete: function (req, res) {
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		restService.select(
			'Agency',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"procedure":'deleteContact',
				"service":'/BRMWrite.svc',
				"objects":[
					{
						"Arguments":{
							"ID_Broker":req.param('id')*1,
							"ID_Agency":req.param('agency')*1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.redirect('/admin/agencies/edit/'+req.param('agency')+'#tab-brokers');
					},
					function(result){
						req.flash('success','Brokerul a fost sters cu succes!');
						return res.redirect('/admin/agencies/edit/'+req.param('agency')+'#tab-brokers');
					}
				);
			}
		);
	}
};
