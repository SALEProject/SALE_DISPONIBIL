module.exports = {

	index: function (req, res) {
		if(req.isSocket) {
			var users = [];
			for(var i in sails.storage.userSessions) {
				users.push(sails.storage.userSessions[i].user);
			}
			/*
			if(Object.keys(sails.io.sockets.sockets).length>0) {
				_.each(Object.keys(sails.io.sockets.sockets), function(session) {
					  var idx = toolsService.searchItemInArray(session,sails.storage.userSessions,'id');
					  if(idx>-1) {
						users.push(sails.storage.userSessions[idx].user);
					  }
				});
			}
			*/
			return res.json({Success: true, ResultType: 'Array', Result: users});
		}
		else return res.view({layout:'empty'});
	},

	users: function (req, res) {
		if (req.xhr) {
			var limit = req.param('iDisplayLength') ? req.param('iDisplayLength')*1 : 10;
			var offset = req.param('iDisplayStart')*1+1;
			var cols = ['LoginName','FirstName','LastName','Email','Agency','UserRole','isActive'];
			var sort = req.param('iSortCol_0') && typeof cols[req.param('iSortCol_0')] !='undefined' ? cols[req.param('iSortCol_0')] : 'LoginName';
			var sortDir = req.param('sSortDir_0');
			var total_count = 0;
		restService.select(
			'Login',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'getusers',
					"objects":[
						{
							"Arguments":{
								"SortField":sort,
								"SortOrder":sortDir,
								"QueryKeyword":req.param('sSearch') ? req.param('sSearch') :null,
								"QueryOffset":offset,
								"QueryLimit":limit
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
							var items = [];
							for(var i=0;i<result.Rows.length;i++) {
								total_count = result.Rows[i].count;
								items.push([
									result.Rows[i].LoginName,
									result.Rows[i].FirstName,
									result.Rows[i].LastName,
									result.Rows[i].Email,
									'<span>' + (result.Rows[i].ID_Agency>0 ? result.Rows[i].CompanyName : 'Utilizator sistem')+ '</span>',
									result.Rows[i].UserRole,
									result.Rows[i].isActive ? 'Activ' : 'Suspendat',
								'<td><a href="/admin/users/edit/' + result.Rows[i].ID + '" class="action-icon btn btn-small btn-success" title="Editeaza"><i class="fa fa-edit"></i></a></td>',
								'<td><a href="/admin/users/' + (result.Rows[i].isActive ? 'disable' : 'enable') +'/' + result.Rows[i].ID + '" class="action-icon btn btn-small btn-default" title="' + (result.Rows[i].isActive ? 'Dezactiveaza' : 'Activeaza') + ' cont"><i class="fa ' + (result.Rows[i].isActive ? 'fa-minus-circle' : 'fa-check-circle') + '"></i></a></td>',
								'<td><a href="/admin/users/delete/' + result.Rows[i].ID + '" title="Sterge" class="action-icon delete-confirm btn btn-small btn-danger"><i class="fa fa-trash-o"></i></a></td>'
								]);
							}
							return res.json({sEcho: req.param('sEcho'), iTotalRecords: total_count, iTotalDisplayRecords: total_count, aaData: items});
						}
					);
				}
			);
		}
		else {
			var title = 'Utilizatori - Panou de control - '+sails.config.appName;
			var layout = 'adminLayout';
			var view = 'admin/users/users';
			return res.view(view,{layout:layout, title:title, users:[]});
		}
	},
  
	user_add: function (req, res) {
		var title = 'Adauga utilizator - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/users/user_add';
		if(req.method == 'POST') {
		restService.select(
			'Login',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'adduser',
					"objects":[
						{
							"Arguments":{
								"LoginName":req.param('LoginName'),
								"LoginPassword":req.param('LoginPassword'),
								"Email":req.param('Email'),
								"FirstName":req.param('FirstName'),
								"LastName":req.param('LastName'),
								"Phone":req.param('Phone'),
								"Fax":req.param('Fax'),
								"Mobile":req.param('Mobile'),
								"SocialCode":req.param('SocialCode'),
								"IdentityCard":req.param('IdentityCard'),
								"ID_Agency":req.param('ID_Agency_none') ? -1 : req.param('ID_Agency')*1,
								"ID_UserRole":_.toArray(_.map(req.param('ID_UserRole'),function(x){ return x*1; }))
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
							req.flash('success','Utilizatorul a fost adaugat cu succes!');
							return res.redirect('/admin/users');
						}
					);
				}
			);
		}
		else return res.view(view,{layout:layout, title:title, item:{}});
	},

	user_edit: function (req, res) {
		var title = 'Modificare utilizator - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/users/user_add';
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		if( req.method == 'POST') {
		restService.select(
			'Login',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'edituser',
					"objects":[
						{
							"Arguments":{
								"ID_User":req.param('id')*1,
								"LoginName":req.param('LoginName'),
								"LoginPassword":req.param('LoginPassword'),
								"Email":req.param('Email'),
								"FirstName":req.param('FirstName'),
								"LastName":req.param('LastName'),
								"Phone":req.param('Phone'),
								"Fax":req.param('Fax'),
								"Mobile":req.param('Mobile'),
								"SocialCode":req.param('SocialCode'),
								"IdentityCard":req.param('IdentityCard'),
								"ID_Agency":req.param('ID_Agency_none') ? -1 : req.param('ID_Agency')*1,
								//"ID_UserRole":(req.param('ID_UserRole')?req.param('ID_UserRole'):'0')*1
								"ID_UserRole":_.toArray(_.map(req.param('ID_UserRole'),function(x){ return x*1; }))
							}
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							var item = req.body;
							item.ID = req.param('id')*1;
							return res.view(view,{layout:layout, title:title, item:item});
						},
						function(result){
							req.flash('success','Utilizatorul a fost modificat cu succes!');
							return res.redirect('/admin/users');
						}
					);
				}
			);
		}
		else {
		restService.select(
			'Login',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'getusers'
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view(view,{layout:layout, title:title});
						},
						function(result){
							var user;
							_.each(result.Rows,function(item){
								if(item.ID==req.param('id')) user = item; 
							});
							if(!user) return res.send(500,'User not found!');
							else return res.view(view,{layout:layout, title:title, item:user});
						}
					);
				}
			);
		}
	},

	user_delete: function (req, res) {
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		restService.select(
			'Login',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'deleteuser',
				"service":'/BRMLogin.svc',
				"objects":[
					{
						"Arguments":{
							"ID_User":req.param('id')*1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.redirect('/admin/users');
					},
					function(result){
						req.flash('success','Utilizatorul a fost sters cu succes!');
						return res.redirect('/admin/users');
					}
				);
			}
		);
	},
	
	user_enable: function (req, res) {
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		restService.select(
			'Login',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'enableuser',
				"service":'/BRMLogin.svc',
				"objects":[
					{
						"Arguments":{
							"ID_User":req.param('id')*1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						if(typeof req.param('agency') != 'undefined' && req.param('agency')!='') {
							return res.redirect('/admin/agencies/edit/'+req.param('agency')+'#tab-brokers');
						}
						else {
							return res.redirect('/admin/users');
						}
					},
					function(result){
						req.flash('success','Utilizatorul a fost reactivat cu succes!');
						if(typeof req.param('agency') != 'undefined' && req.param('agency')!='') {
							return res.redirect('/admin/agencies/edit/'+req.param('agency')+'#tab-brokers');
						}
						else {
							return res.redirect('/admin/users');
						}
					}
				);
			}
		);
	},
	
	user_disable: function (req, res) {
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		restService.select(
			'Login',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'disableuser',
				"service":'/BRMLogin.svc',
				"objects":[
					{
						"Arguments":{
							"ID_User":req.param('id')*1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						if(typeof req.param('agency') != 'undefined' && req.param('agency')!='') {
							return res.redirect('/admin/agencies/edit/'+req.param('agency')+'#tab-brokers');
						}
						else {
							return res.redirect('/admin/users');
						}
					},
					function(result){
						req.flash('success','Utilizatorul a fost dezactivat cu succes!');
						if(typeof req.param('agency') != 'undefined' && req.param('agency')!='') {
							return res.redirect('/admin/agencies/edit/'+req.param('agency')+'#tab-brokers');
						}
						else {
							return res.redirect('/admin/users');
						}
					}
				);
			}
		);
	}
};
