module.exports = {

	clients: function (req, res) {
		if (req.xhr) {
			var limit = req.param('iDisplayLength') ? req.param('iDisplayLength')*1 : 10;
			var offset = req.param('iDisplayStart')*1+1;
			var cols = ['Code','ClientName','Status','FiscalCode','RegisterCode'];
			var sort = req.param('iSortCol_0') && typeof cols[req.param('iSortCol_0')] !='undefined' ? cols[req.param('iSortCol_0')] : 'Code';
			var sortDir = req.param('sSortDir_0');
			var total_count = 0;
		restService.select(
			'Client',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'dashboard',
					"method":'select',
					"procedure":'getClients',
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
									result.Rows[i].Code,
									result.Rows[i].ClientName,
									result.Rows[i].Status=='active' ? 'Activ' : result.Rows[i].Status=='inactive' ? 'Inactiv' : result.Rows[i].Status=='suspended' ? 'Suspended' : '',
									result.Rows[i].FiscalCode,
									result.Rows[i].RegisterCode,
								'<td><a href="/admin/clients/edit/' + result.Rows[i].ID + '" class="action-icon btn btn-small btn-success" title="Editeaza"><i class="fa fa-edit"></i></a></td>',
								'<td><a href="/admin/clients/delete/' + result.Rows[i].ID + '" title="Sterge" class="action-icon delete-confirm btn btn-small btn-danger"><i class="fa fa-trash-o"></i></a></td>'
								]);
							}
							return res.json({sEcho: req.param('sEcho'), iTotalRecords: total_count, iTotalDisplayRecords: total_count, aaData: items});
						}
					);
				}
			);
		}
		else {
			var title = 'Clienti - Panou de control - '+sails.config.appName;
			var layout = 'adminLayout';
			var view = 'admin/clients/clients';
			return res.view(view,{layout:layout, title:title, items:[]});
		}
	},
  
  
	client_add: function (req, res) {
		var title = 'Adaugare client - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/clients/client_add';
		var agency = null;
		if(req.param('agency')) {
			agency = toolsService.getArrayItem(req.session.agencies,req.param('agency')*1);
		}
		if(req.method == 'POST') {
		restService.select(
			'Client',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'addClient',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Agency":req.param('ID_Agency'),
								"Code":req.param('Code'),
								"Name":req.param('Name'),
								"FirstName":req.param('FirstName'),
								"LastName":req.param('LastName'),
								"Status":req.param('Status'),
								"FiscalCode":req.param('FiscalCode'),
								"RegisterCode":req.param('RegisterCode'),
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
							return res.view(view,{layout:layout, title:title, item:req.body, agency:agency});
						},
						function(result){							
							req.flash('success','Clientul a fost adaugat cu succes!');
							if(typeof result == 'object' && typeof result.ID_Client != 'undefined') {
								return res.redirect('/admin/clients/edit/'+result.ID_Client+(req.param('agency') ? '?agency='+req.param('agency') : ''));
							}
							else if(req.param('agency')) {
								return res.redirect('/admin/agencies/edit/'+req.param('agency'));
							}
							else {
								return res.redirect('/admin/clients');
							}
						}
					);
				}
			);
		}
		else return res.view(view,{layout:layout, title:title, item:{}, agency:agency});
	},

	client_edit: function (req, res) {
		var title = 'Modificare client - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/clients/client_add';
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		var agency = null;
		if(req.param('agency')) {
			agency = toolsService.getArrayItem(req.session.agencies,req.param('agency')*1);
		}
		if(req.method == 'POST') {
		restService.select(
			'Client',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'editClient',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Client":req.param('id')*1,
								"ID_Agency":req.param('ID_Agency')*1,
								"Code":req.param('Code'),
								"Name":req.param('Name'),
								"FirstName":req.param('FirstName'),
								"LastName":req.param('LastName'),
								"Status":req.param('Status'),
								"FiscalCode":req.param('FiscalCode'),
								"RegisterCode":req.param('RegisterCode'),
								"isHouse":(req.param('isHouse')=='1'?true:false),
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
							return res.view(view,{layout:layout, title:title, item:req.body, agency:agency});
						},
						function(result){
							req.flash('success','Clientul a fost modificat cu succes!');
							return res.redirect('/admin/clients/edit/'+req.param('id')+ (req.param('agency') ? '?agency='+req.param('agency') : ''));
							/*
							if(req.param('agency')) {
								return res.redirect('/admin/agencies/edit/'+req.param('agency'));
							}
							else {
								return res.redirect('/admin/clients');
							}
							*/
						}
					);
				}
			);
		}
		else {
		restService.select(
			'Client',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getClients',
					"objects":[{
						"Arguments":{
							ID_Client:req.param('id')*1
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
							var client;
							_.each(result.Rows,function(item){
								if(item.ID==req.param('id')) client = item; 
							});
							if(!client) return res.send(500,'Client not found!');
							return res.view(view,{layout:layout, title:title, item:client, agency:agency});
						}
					);
				}
			);
		}
	},

	asset_clients: function (req, res) {
		var title = 'Clienti - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/clients/asset_clients';
		var asset = null;
		if(req.param('asset')) {
			var asset = req.session.asset;
			if(!asset) {
				req.flash('error','Activul nu a fost gasit!');;
				return res.redirect('/admin/assets');
			}
		}
		if(asset.ID_InitialOrder) {
		restService.select(
			'Order',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getOrders',
					"objects":[{
						"Arguments":{
							"ID_Market":sails.marketId,
							"ID_Order":asset.ID_InitialOrder,
							"all":true,
							"anystatus":true
						}
					}]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view({layout:layout, title:title, asset:asset, initialOrder:{}});
						},
						function(result){
							var order = toolsService.getArrayItem(result.Rows,asset.ID_InitialOrder);
							if(!order) order = {};
							if(req.method == 'POST') {
								if(req.param('Validate')=='1') {
		restService.select(
			'Ring',
										{
											"SessionId":sessionService.getSessionID(req),
											"currentState":'dashboard',
											"method":'select',
											"procedure":'validate',
											"objects":[{
												"Arguments":{
													"ID_Asset":asset.ID,
													"ID_Market":sails.marketId
												}
											}]
										},
										function(error,response) {
											return parserService.parse(error,response,
												function(err){
													req.flash('error',err);
													return res.view(view,{layout:layout, title:title, asset:asset, initialOrder:order});
												},
												function(result){
													toolsService.parseValidation(result,req);
													return res.view(view,{layout:layout, title:title, asset:asset, initialOrder:order});
												}
											);
										}
									);
								}
								else {
									req.flash('success','Datele au fost salvate cu succes!');
									return res.redirect('/admin/documents/asset_documents'+(asset ? '?asset='+asset.ID : ''));
								}
							}
							else {
								return res.view(view,{layout:layout, title:title, asset:asset, initialOrder: order});
							}
						}
					);
				}
			);
		}
		else {
			if(req.method == 'POST') {
				if(req.param('Validate')=='1') {
		restService.select(
			'Ring',
						{
							"SessionId":sessionService.getSessionID(req),
							"currentState":'dashboard',
							"method":'select',
							"procedure":'validate',
							"objects":[{
								"Arguments":{
									"ID_Asset":asset.ID,
									"ID_Market":sails.marketId
								}
							}]
						},
						function(error,response) {
							return parserService.parse(error,response,
								function(err){
									req.flash('error',err);
									return res.view(view,{layout:layout, title:title, asset:asset, initialOrder:{}});
								},
								function(result){
									if(result.Rows.length > 0)
										req.flash('error',result.Rows);
									else
										req.flash('info',result.Rows);

									return res.view(view,{layout:layout, title:title, asset:asset, initialOrder:{}});
								}
							);
						}
					);
				}
				else {
					req.flash('success','Datele au fost salvate cu succes!');
					return res.redirect('/admin/documents/asset_documents'+(asset ? '?asset='+asset.ID : ''));
				}
			}
			else {
				return res.view(view,{layout:layout, title:title, asset:asset, initialOrder:{}});
			}
		}
	},

	client_delete: function (req, res) {
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		restService.select(
			'Client',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"procedure":'deleteClient',
				"service":'/BRMWrite.svc',
				"objects":[
					{
						"Arguments":{
							"ID_Client":req.param('id')*1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						if(req.param('agency')) {
							return res.redirect('/admin/agencies/edit/'+req.param('agency'));
						}
						else {
							return res.redirect('/admin/clients');
						}
					},
					function(result){
						req.flash('success','Clientul a fost sters cu succes!');
						if(req.param('agency')) {
							return res.redirect('/admin/agencies/edit/'+req.param('agency'));
						}
						else {
							return res.redirect('/admin/clients');
						}
					}
				);
			}
		);
	}
};
