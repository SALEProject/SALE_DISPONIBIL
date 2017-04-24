module.exports = {

	index: function (req, res) {
		return res.redirect('/account/profile');
	},

	login: function (req, res) {
		if(req.session.authenticated) {
			if(req.session.currentUser.isAdministrator) return res.redirect('/admin');
			else {
				if(typeof sails.storage.userSessions[req.session.currentUser.ID] == 'undefined') {
					console.log('session expired');
					req.flash('error',req.session.getTranslation('User_session_expired'));
				}
				else if(sails.storage.userSessions[req.session.currentUser.ID].sid != sessionService.getSessionID(req)) {
					// bogus session. kill it with fire!!
					console.log('session different');
					req.flash('error',req.session.getTranslation('User_logged_in_with_different_session'));
					return res.redirect('/logout');
				}
				else {
					sails.storage.userSessions[req.sessionID].lastUpdate = Date.now();
				}
				return res.redirect('/');
			}
		}
		var errorMsg = ''
		if(req.method == 'POST') {
			if(req.param('ID_UserRole')) {
				restService.select(
					'Login',
					{
						"SessionId":req.sessionID,
						"currentState":'login',
						"method":'login',
						"objects":[
							{
								"Login":{
									"LoginName":req.session.submit.username,
									"LoginPassword":req.session.submit.password,
									"CertificateFingerprint":'',
									"Language":req.session.submit.language,
									"ID_UserRole":req.param('ID_UserRole')*1,
									"EntryPoint":sails.config.entryPoint
								}
							}
						]
					},
					function(error,response) {
						return parserService.parse(error,response,
							function(err){
								return res.view({layout:'loginLayout', title:'Login', errorMsg:err, transactions:req.session.transactions.slice(-5,req.session.transactions.length).reverse(), lastSession:req.session.lastSession});
							},
							function(result){
								req.session.authenticated = true;
								req.session.currentUser = result.User;
								req.session.lang = sails.languages[req.session.submit.language.toLowerCase()];
								//sails.storage.users[req.sessionID] = result.User;
								//sails.storage.users[req.sessionID].lastUpdate = Date.now();
								//sails.storage.userSessions[req.sessionID] = {ID_User:result.User.ID, lastUpdate:Date.now()};
								var userRole = toolsService.getArrayItem(req.session.userRoles,req.param('ID_UserRole')*1);
								req.session.currentUser.role = userRole;
								if(result.User.isAdministrator || userRole.isAdministrator) {
									req.session.currentUser.isAdministrator = true;
									//sails.storage.userSessions[result.User.ID].socket = '1';
									sails.storage.userSessions[result.User.ID] = {sid:req.sessionID, lastUpdate:Date.now(), user:result.User};
									return res.redirect('/admin');
								}
								else {
									sails.storage.userSessions[result.User.ID] = {sid:req.sessionID, lastUpdate:Date.now(), user:result.User};
									return res.redirect('/');
								}
							}
						);
					}
				);
			}
			else {
				restService.select(
					'Login',
					{
						"SessionId":req.sessionID,
						"currentState":'login',
						"method":'login',
						"objects":[
							{
								"Login":{
									"LoginName":req.param('txtusername'),
									"LoginPassword":req.param('txtpassword'),
									"CertificateFingerprint":'',
									"Language":req.param('Language'),
									"EntryPoint":sails.config.entryPoint
								}
							}
						]
					},
					function(error,response) {
						return parserService.parse(error,response,
							function(err){
								return res.view({layout:'loginLayout', title:'Login', errorMsg:err, transactions:req.session.transactions.slice(-5,req.session.transactions.length).reverse(), lastSession:req.session.lastSession});
							},
							function(result){
								if(result.User.isAdministrator) {
									req.session.authenticated = true;
									req.session.currentUser = result.User;
									sails.storage.userSessions[result.User.ID] = {sid:req.sessionID, lastUpdate:Date.now(), user:result.User};
									//req.session.currentUser.role = userRole;
									req.session.lang = sails.languages[req.param('Language').toLowerCase()];
									return res.redirect('/admin');
								}
								else {
									var roles = JSON.parse(result.User.ID_UserRole);
									if(roles.length==1) {
										restService.select(
											'Login',
											{
												"SessionId":req.sessionID,
												"currentState":'login',
												"method":'login',
												"objects":[
													{
														"Login":{
															"LoginName":req.param('txtusername'),
															"LoginPassword":req.param('txtpassword'),
															"CertificateFingerprint":'',
															"Language":req.param('Language'),
															"ID_UserRole":roles[0],
															"EntryPoint":sails.config.entryPoint
														}
													}
												]
											},
											function(error,response) {
												return parserService.parse(error,response,
													function(err){
														return res.view({layout:'loginLayout', title:'Login', errorMsg:err, transactions:req.session.transactions.slice(-5,req.session.transactions.length).reverse(), lastSession:req.session.lastSession});
													},
													function(result){
														req.session.authenticated = true;
														req.session.currentUser = result.User;
														req.session.lang = sails.languages[req.param('Language').toLowerCase()];
														//sails.storage.users[req.sessionID] = result.User;
														//sails.storage.users[req.sessionID].lastUpdate = Date.now();
														//sails.storage.userSessions[req.sessionID] = {ID_User:result.User.ID, lastUpdate:Date.now()};
														var userRole = toolsService.getArrayItem(req.session.userRoles,roles[0]);
														req.session.currentUser.role = userRole;
														if(result.User.isAdministrator || userRole.isAdministrator) {
														//if(result.User.isAdministrator) {
															//sails.storage.userSessions[result.User.ID].socket = '1';
															req.session.currentUser.isAdministrator = true;
															sails.storage.userSessions[result.User.ID] = {sid:req.sessionID, lastUpdate:Date.now(), user:result.User};
															return res.redirect('/admin');
														}
														else {
															sails.storage.userSessions[result.User.ID] = {sid:req.sessionID, lastUpdate:Date.now(), user:result.User};
															return res.redirect('/');
														}
													}
												);
											}
										);
									}
									else {
										req.session.submit = { username:req.param('txtusername'), password:req.param('txtpassword'), language:req.param('Language'), roles:roles};
										return res.view({layout:'loginLayout', title:'Login', errorMsg:'', transactions:req.session.transactions.slice(-5,req.session.transactions.length).reverse(), lastSession:req.session.lastSession, submit:{username:req.param('txtusername'), password:req.param('txtpassword'), language:req.param('Language'), roles:roles}});
									}
								}
								/*
								req.session.authenticated = true;
								req.session.currentUser = result.User;
								req.session.lang = sails.languages[req.param('Language').toLowerCase()];
								//sails.storage.users[req.sessionID] = result.User;
								//sails.storage.users[req.sessionID].lastUpdate = Date.now();
								//sails.storage.userSessions[req.sessionID] = {ID_User:result.User.ID, lastUpdate:Date.now()};
								else {
									sails.storage.userSessions[result.User.ID] = {sid:req.sessionID, lastUpdate:Date.now(), user:result.User};
									return res.redirect('/');
								}
								*/
							}
						);
					}
				);
			}
		}
		else {
			return res.view({layout:'loginLayout', title:'Login', errorMsg:errorMsg, transactions:req.session.transactions.slice(-5,req.session.transactions.length).reverse(), lastSession:req.session.lastSession});
		}
	},

	recover: function (req, res) {
		var title = req.session.getTranslation('Recover_password');
		return res.view({layout:'loginLayout', title:title});
	},

	logout: function (req, res) {
		req.session.authenticated = false;
		if(typeof req.session.currentUser != 'undefined' && req.session.currentUser && typeof sails.storage.userSessions[req.session.currentUser.ID] != 'undefined' && typeof sails.storage.userSessions[req.session.currentUser.ID].sid != 'undefined' && sails.storage.userSessions[req.session.currentUser.ID].sid == req.sessionID) {
			delete sails.storage.userSessions[req.session.currentUser.ID];
		}
		if(typeof req.session.currentUser != 'undefined' && req.session.currentUser && typeof req.session.currentUser.ID != 'undefined') {
			User.publishCreate({id:req.session.currentUser.ID});
		}
		req.session.currentUser = null;
		var flash = req.flash();
		//req.session.destroy();
		if(typeof flash.error != 'undefined') req.flash('error',flash.error);
		return res.redirect('/login');
	},

	profile: function (req, res) {
		var title = req.session.getTranslation('Profile');
		var layout = 'accountLayout';
		var section = 'agency';
		var view = 'account/profile';
		
		return res.view(view,{layout:layout, section: section, title:title, item:{}});
	},

	edit_profile: function (req, res) {
		var title = req.session.getTranslation('Edit_profile');
		var layout = 'accountLayout';
		var section = 'agency';
		var view = 'account/edit_profile';
		
		if(req.method == 'POST') {
		restService.select(
			'Agency',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":"editContact",
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Broker":req.session.currentUser.ID_Broker*1,
								"ID_Agency":req.session.currentUser.ID_Agency*1,
								"FirstName":req.param('FirstName'),
								"LastName":req.param('LastName'),
								"Email":req.param('Email'),
								"Phone":req.param('Phone'),
								"Fax":req.param('Fax'),
								"Mobile":req.param('Mobile'),
								"SocialCode":req.param('SocialCode'),
								"IdentityCard":req.param('IdentityCard')
							}
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view(view,{layout:layout, section: section, title:title, item:req.body});
						},
						function(result){
							req.flash('success', req.session.getTranslation('User_modified_success'));
							req.session.currentUser.FirstName = req.param('FirstName');
							req.session.currentUser.LastName = req.param('LastName');
							req.session.currentUser.Email = req.param('Email');
							req.session.currentUser.Phone = req.param('Phone');
							req.session.currentUser.Fax = req.param('Fax');
							req.session.currentUser.Mobile = req.param('Mobile');
							req.session.currentUser.SocialCode = req.param('SocialCode');
							req.session.currentUser.IdentityCard = req.param('IdentityCard');
							return res.redirect('/account/profile');
						}
					);
				}
			);
		}
		else return res.view(view,{layout:layout, section: section, title:title, item:{}});
	},

	change_password: function (req, res) {
		var title = req.session.getTranslation('Profile') + ' - ' + req.session.getTranslation('Change_password');
		var layout = 'accountLayout';
		var section = 'agency';
		var view = 'account/change_password';
		
		if(req.method == 'POST') {
		restService.select(
			'User',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":"changePassword",
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_User":req.session.currentUser.ID*1,
								"LoginPassword":req.param('LoginPassword'),
								"LoginPasswordConfirm":req.param('LoginPasswordConfirm')
							}
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view(view,{layout:layout, section: section, title:title, item:req.body});
						},
						function(result){
							req.flash('success', req.session.getTranslation('Password_changed_success'));
							return res.redirect('/account');
						}
					);
				}
			);
		}
		else return res.view(view,{layout:layout, section: section, title:title, item:{}});
	},

	agency_view: function (req, res) {
		var title = req.session.getTranslation('Agency_details');
		var layout = 'accountLayout';
		var section = 'agency';
		var view = 'account/agency_view';
		
		var agency;
		_.each(req.session.agencies, function(item){
			if(item.ID==req.session.currentUser.ID_Agency) agency = item;
		});

		if(!agency) return res.send(500,req.session.getTranslation('Agency_not_found'));
		return res.view(view,{layout:layout, section: section, title:title, item:agency});
	},

	agency_edit: function (req, res) {
		var title = req.session.getTranslation('Agency_edit');
		var layout = 'accountLayout';
		var section = 'agency';
		var view = 'account/agency_edit';

		var agency;
		_.each(req.session.agencies, function(item){
			if(item.ID==req.session.currentUser.ID_Agency) agency = item;
		});

		if(!agency) return res.send(500,req.session.getTranslation('Agency_not_found'));
		if(req.method == 'POST') {
		restService.select(
			'Agency',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'editAgency',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Agency":agency.ID,
								"Code":req.param('Code'),
								"Name":req.param('Name'),
								"FiscalCode":req.param('FiscalCode'),
								"RegisterCode":req.param('RegisterCode'),
								"CompanyName":req.param('CompanyName'),
								"Phone":req.param('Phone'),
								"Mobile":req.param('Mobile'),
								"Fax":req.param('Fax'),
								"Email":req.param('Email'),
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
							return res.view(view,{layout:layout, section: section, title:title, item:req.body});
						},
						function(result){
							req.flash('success',req.session.getTranslation('Agency_change_success'));
							return res.redirect('/account/agency_view');
						}
					);
				}
			);
		}
		else {
			return res.view(view,{layout:layout, section: section, title:title, item:agency});
		}
	},

	agency_users: function (req, res) {
		var title = req.session.getTranslation('Brokers');
		var layout = 'accountLayout';
		var section = 'agency';
		var view = 'account/agency_users';
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
						return res.view(view,{layout:layout, section: section, title:title, users:[]});
					},
					function(result){
						return res.view(view,{layout:layout, section: section, title:title, users:result.Rows});
					}
				);
			}
		);
	},

	agency_clients: function (req, res) {
		var title = req.session.getTranslation('Clients');
		var layout = 'accountLayout';
		var section = 'agency';
		var view = 'account/agency_clients';
		restService.select(
			'Client',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getClients'
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error', err);
						return res.view(view,{layout:layout, section: section, title:title, items:[]});
					},
					function(result){
						return res.view(view,{layout:layout, section: section, title:title, items:result.Rows});
					}
				);
			}
		);
	},

	agency_assets: function (req, res) {
		var title = req.session.getTranslation('Agency_assets');
		var layout = 'accountLayout';
		var section = 'assets';
		var view = 'account/agency_assets';
		
		restService.select(
			'Agency',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getAgencyAssets',
				"objects":[
					{
						"Arguments":{
							"ID_Agency":req.session.currentUser.ID_Agency,
							"ID_Asset": -1,
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view(view,{layout:layout, section: section, title:title, items:[]});
					},
					function(result){
						return res.view(view,{layout:layout, section: section, title:title, items:result.Rows});
					}
				);
			}
		);
	},

	agency_asset_view: function (req, res) {
		var title = req.session.getTranslation('Asset_details');
		var layout = 'accountLayout';
		var section = 'assets';
		var view = 'account/agency_asset_view';
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		restService.select(
			'Agency',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getAgencyAssets',
				"objects":[
					{
						"Arguments":{
							"ID_Agency":req.session.currentUser.ID_Agency,
							"ID_Asset": req.param('id')*1,
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view(view,{layout:layout, section: section, title:title, item:[]});
					},
					function(result){
						return res.view(view,{layout:layout, section: section, title:title, item:result.Rows[0]});
					}
				);
			}
		);
	},

	market_assets: function (req, res) {
		var title = req.session.getTranslation('Assets');
		var layout = 'accountLayout';
		var section = 'assets';
		var view = 'account/agency_assets';
		
		restService.select(
			'Agency',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getAgencyAssets',
				"objects":[
					{
						"Arguments":{
							"ID_Agency":-1,
							"ID_Asset": -1,
							"StartDate": new Date(),							
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view(view,{layout:layout, section: section, title:title, items:[]});
					},
					function(result){
						return res.view(view,{layout:layout, section: section, title:title, items:result.Rows});
					}
				);
			}
		);
	},

	today_assets: function (req, res) {
		var title = req.session.getTranslation('Assets_today');
		var layout = 'accountLayout';
		var view = 'account/agency_assets';
		var section = 'assets';
		var moment = require('moment');
		var startDate = moment().format('YYYY-MM-DDT00:00:00.000');
		var endDate = moment().format('YYYY-MM-DDT23:59:59.000');

		restService.select(
			'Agency',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getAgencyAssets',
				"objects":[
					{
						"Arguments":{
							"ID_Agency":-1,
							"ID_Asset": -1,
							"StartDate": startDate,
							"EndDate": endDate,
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view(view,{layout:layout, section: section, title:title, items:[]});
					},
					function(result){
						return res.view(view,{layout:layout, section: section, title:title, items:result.Rows});
					}
				);
			}
		);
	},

	current_assets: function (req, res) {
		var title = req.session.getTranslation('Current_assets');
		var layout = 'accountLayout';
		var view = 'account/agency_assets';
		var section = 'assets';
		var moment = require('moment');
		var startDate = moment().format('YYYY-MM-DDT00:00:00.000');
		var endDate = moment().format('YYYY-MM-DDT23:59:59.000');

		restService.select(
			'Agency',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getAgencyAssets',
				"objects":[
					{
						"Arguments":{
							"ID_Agency":-1,
							"ID_Asset": -1,
							"StartDate": startDate,
							"EndDate": endDate,
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view(view,{layout:layout, section: section, title:title, items:[]});
					},
					function(result){
						var assets = [];
						_.each(result.Rows, function(item){
							
							if((item.PreOpeningTime<=  moment().format('HH:mm:ss.SSS')) && (moment().format('HH:mm:ss.SSS') < item.ClosingTime)) {
								assets.push(item);
							}
						});
						return res.view(view,{layout:layout, section: section, title:title, items:assets});
					}
				);
			}
		);
	},

	agency_warranties: function (req, res) {
		var title = req.session.getTranslation('Warranties');
		var layout = 'accountLayout';
		var section = 'agency';
		var view = 'account/agency_warranties';

		restService.select(
			'Warranty',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getWarranties',
				"objects":[
					{
						"Arguments":{
							"ID_Agency":req.session.currentUser.ID_Agency
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view(view,{layout:layout, section: section, title:title, items:[]});
					},
					function(result){
						return res.view(view,{layout:layout, section: section, title:title, items:result.Rows});
					}
				);
			}
		);
	},
	
	notifications: function(req,res) {
		var title = 'Mesaje';
		var section = 'agency';
		var layout = 'accountLayout';
		var view = 'account/notifications';
		restService.select(
			'Alert',
			{
				"SessionId":req.sessionID,
				"currentState":'login',
				"method":'select',
				"procedure":'getNotifications',
				"objects": [
					{
						"Arguments": {
							"Since": (req.param('since') ? req.param('since') : '2014-01-01 00:00' )
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view(view,{layout:layout, section: section, title:title, items:[]});
					},
					function(result){
						return res.view(view,{layout:layout, section: section, title:title, items:result.Rows});
					}
				);
			}
		);
	},
};
