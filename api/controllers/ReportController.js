module.exports = {

	index: function (req, res) {
		return res.redirect('/reports/orders');
	},

	orders: function (req, res) {
		var title = req.session.getTranslation('Order_history');
		var section = 'reports';
		var layout = 'accountLayout';
		var msg = '';
		var view = 'report/index';

		if(req.method=="POST") {
		restService.select(
			'GridReport',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getReportDataSet',
					"objects":
					[
						{
							"Arguments":
							{
								"ReportName": 'Istoric Ordine',
								"StartDate": req.param('StartDate'),
								"EndDate": req.param('EndDate')
							}
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view(view, { layout: layout, title:title, section:section, reporttypes:req.session.reportTypes});
						},
						function(result){
							return res.view(view, { layout: layout, title:title, section:section, reporttypes:req.session.reportTypes, table:result.Columns, data:result.Rows});
						}
					);
				}
			);
		}
		else return res.view(view, { layout: layout, title:title, section:section, reporttypes:req.session.reportTypes});
	},

	transactions: function (req, res) {
		var title = req.session.getTranslation('Transaction_history');
		var section = 'reports';
		var layout = 'accountLayout';
		var msg = '';
		var view = 'report/index';

		if(req.method=="POST") {
		restService.select(
			'GridReport',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getReportDataSet',
					"objects":
					[
						{
							"Arguments":
							{
								"ReportName": 'Istoric Tranzactii',
								"StartDate": req.param('StartDate'),
								"EndDate": req.param('EndDate')
							}
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view(view, { layout: layout, title:title, section:section, reporttypes:req.session.reportTypes});
						},
						function(result){
							return res.view(view, { layout: layout, title:title, section:section, reporttypes:req.session.reportTypes, table:result.Columns, data:result.Rows});
						}
					);
				}
			);
		}
		else return res.view(view, { layout: layout, title:title, section:section, reporttypes:req.session.reportTypes});
	},

	events: function (req, res) {
		var title = req.session.getTranslation('Events');
		var section = 'reports';
		var layout = 'accountLayout';
		var msg = '';
		var view = 'report/index';

		if(req.method=="POST") {
		restService.select(
			'GridReport',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getReportDataSet',
					"objects":
					[
						{
							"Arguments":
							{
								"ReportName": 'Istoric Tranzactii',
								"StartDate": req.param('StartDate'),
								"EndDate": req.param('EndDate')
							}
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view(view, { layout: layout, title:title, section:section, reporttypes:req.session.reportTypes});
						},
						function(result){
							return res.view(view, { layout: layout, title:title, section:section, reporttypes:req.session.reportTypes, table:result.Columns, data:result.Rows});
						}
					);
				}
			);
		}
		else return res.view(view, { layout: layout, title:title, section:section, reporttypes:req.session.reportTypes});
	},

	download:function(req,res) {
		if(!req.param('id')) return res.send(404);
		else {
		restService.select(
			'Report',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'generatereport',
					"procedure":'Transaction',
					"objects":
					[
						{
							"Arguments":
							{
								"ID_Transaction": req.param('id')*1
							}
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							return res.send(err,500);
						},
						function(result){
							res.setHeader('Content-disposition', 'attachment; filename="' + result.FileName + '"');
							res.setHeader('Content-type', 'application/pdf')
							var buf = new Buffer(result.Base64Data, 'base64');;
							return res.send(buf);
						}
					);
				}
			);
		}
	},

	assets_index: function (req, res) {
		var title = 'Active - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/admin_reports/index';
		var ring = null;
		if(req.param('ring')) {
			ring = req.param('ring') * 1;
		}

		if (req.xhr) {
			var limit = req.param('iDisplayLength') ? req.param('iDisplayLength')*1 : 10;
			var offset = req.param('iDisplayStart')*1+1;
			var cols = ['Name','Code','Ring','isActive'];
			var sort = req.param('iSortCol_0') && typeof cols[req.param('iSortCol_0')] !='undefined' ? cols[req.param('iSortCol_0')] : 'Name';
			//var sort = 'Name';
			var sortDir = req.param('sSortDir_0');
			var total_count = 0;
		restService.select(
			'Ring',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'dashboard',
					"method":'select',
					"procedure":'getAssets',
					"objects":[
						{
							"Arguments":{
								"ID_Market":sails.marketId,
								"ID_Ring": (ring ? ring*1 : -1),
								"anystatus":true,
								"all":true,
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
									req.session.getTranslation(result.Rows[i].Name),
									result.Rows[i].Code,
									(toolsService.searchIdInArray(result.Rows[i].ID_Ring,sails.storage.rings)>-1 ? req.session.getTranslation(sails.storage.rings[toolsService.searchIdInArray(result.Rows[i].ID_Ring,sails.storage.rings)]['Name']) : '-'),
									result.Rows[i].isActive ? 'Da' : 'Nu',
									result.Rows[i].MeasuringUnit,
									'<td class="v-align-middle">'+
										'<div class="btn-group">'+
											'<a class="btn btn-small dropdown-toggle btn-primary" data-toggle="dropdown" href="#">Raport <span class="caret"></span> </a>'+
											'<ul class="dropdown-menu">'+
												'<li><a href="/admin/reports/assets/tradesession/' + result.Rows[i].ID + '">Jurnal</a></li>'+
												'<li><a href="/admin/reports/assets/participants/' + result.Rows[i].ID + '">Participanti la sedinta</a></li>'+
												'<li><a href="/admin/reports/assets/transactions/' + result.Rows[i].ID + '">Tranzactii</a></li>'+
												'<li><a href="/admin/reports/assets/orders/' + result.Rows[i].ID + '">Ordine</a></li>'+
												'<li><a href="/admin/reports/assets/warranties/' + result.Rows[i].ID + '">Garantii</a></li>'+
												'<li><a href="/admin/reports/assets/documents/' + result.Rows[i].ID + '">Documente</a></li>'+
												'<li><a href="/admin/reports/assets/quotes/' + result.Rows[i].ID + '">Cotatii</a></li>'+
												'<li><a href="/admin/reports/assets/tradeparams/' + result.Rows[i].ID + '">Parametrii tranzactionare</a></li>'+
											'</ul>'+
										'</div>'+
									'</td>'
								]);
							}
							return res.json({sEcho: req.param('sEcho'), iTotalRecords: total_count, iTotalDisplayRecords: total_count, aaData: items});
						}
					);
				}
			);
		}
		else {
			return res.view(view,{layout:layout, title:title, items:[]});
		}
	},

	assets_participants: function (req, res) {
		var title = 'Active - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/admin_reports/assets_participants';
		var ring = null;
		var ID_Asset = req.param('id') * 1;
		var asset = req.session.asset;
		if(!asset) return res.send(404);
		restService.select(
			'Ring',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getAssetClients',
				"objects": [
					{
						"Arguments": {
							"ID_Asset": (ID_Asset ? ID_Asset*1 : -1)
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view(view,{layout:layout, title:title, items:[], asset: asset});
					},
					function(result){
						return res.view(view,{layout:layout, title:title, items:result.Rows, asset: asset});
					}
				);
			}
		);
	},

	assets_orders: function (req, res) {
		var title = 'Ordine - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/admin_reports/assets_orders';
		var ID_Asset = req.param('id') * 1;
		var asset = req.session.asset;
		if(!asset) return res.send(404);
		restService.select(
			'GridReport',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getDISPOrdersReport',
				"objects":[
					{
						"Arguments":{
							"ID_Market":sails.marketId,
							"ID_Broker":-1,
							"all":true,
							"anystatus":true,
							"ID_Asset": (ID_Asset ? ID_Asset*1 : -1)
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view(view,{layout:layout, title:title, items:[], asset: asset});
					},
					function(result){
						return res.view(view,{layout:layout, title:title, items:result.Rows, asset: asset});
					}
				);
			}
		);
	},

	assets_transactions: function (req, res) {
		var title = 'Tranzactii - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/admin_reports/assets_transactions';
		var ID_Asset = req.param('id') * 1;
		var asset = req.session.asset;
		if(!asset) return res.send(404);
		restService.select(
			'Transaction',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getTransactions',
				"objects":[
					{
						"Arguments":{
							"ID_Broker": -1,
							"ID_Asset": (ID_Asset ? ID_Asset*1 : -1),
							"StartDate": '2015-01-01T12:00:00.000',
							"EndDate": '2100-01-01T12:00:00.000'
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view(view,{layout:layout, title:title, items:[], asset: asset});
					},
					function(result){
						return res.view(view,{layout:layout, title:title, items:result.Rows, asset: asset});
					}
				);
			}
		);
	},

	assets_warranties: function (req, res) {
		var title = 'Garantii - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/admin_reports/assets_warranties';
		var ID_Asset = req.param('id') * 1;
		var asset = req.session.asset;
		if(!asset) return res.send(404);
		restService.select(
			'Warranty',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getAssetWarranties',
				"objects":[
					{
						"Arguments":{
							"ID_Asset": (ID_Asset ? ID_Asset*1 : -1)
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view(view,{layout:layout, title:title, items:[], asset: asset});
					},
					function(result){
						return res.view(view,{layout:layout, title:title, items:result.Rows, asset: asset});
					}
				);
			}
		);
	},

	assets_documents: function (req, res) {
		var title = 'Documente - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/admin_reports/assets_documents';
		var ID_Asset = req.param('id') * 1;
		var asset = req.session.asset;
		if(!asset) return res.send(404);
		restService.select(
			'Document',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getDocuments',
				"objects":[
					{
						"Arguments":{
							"ID_Asset": (ID_Asset ? ID_Asset*1 : -1),
							"all":true
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view(view,{layout:layout, title:title, items:[], asset: asset});
					},
					function(result){
						return res.view(view,{layout:layout, title:title, items:result.Rows, asset: asset});
					}
				);
			}
		);
	},

	assets_quotes: function (req, res) {
		var title = 'Tranzactii - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/admin_reports/assets_quotes';
		var ID_Asset = req.param('id') * 1;
		var asset = req.session.asset;
		if(!asset) return res.send(404);
		restService.select(
			'Webcontent',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getAssetQuotations',
				"objects":[
					{
						"Arguments":{
							"ID_Asset": (ID_Asset ? ID_Asset*1 : -1)
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view(view,{layout:layout, title:title, items:[], asset: asset});
					},
					function(result){
						return res.view(view,{layout:layout, title:title, items:result.Rows, asset: asset});
					}
				);
			}
		);
	},

	assets_tradeparams: function (req, res) {
		var title = 'Detalii Activ - Contul meu - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/admin_reports/assets_tradeparams';
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		var ID_Asset = req.param('id') * 1;
		var asset = req.session.asset;
		if(!asset) return res.send(404);
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
							"ID_Asset": (ID_Asset ? ID_Asset*1 : -1)
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view(view,{layout:layout, title:title, items:[], asset: asset});
					},
					function(result){
						return res.view(view,{layout:layout, title:title, item:result.Rows[0], asset: asset});
					}
				);
			}
		);
	},

	assets_tradesession: function (req, res) {
		var title = 'Raport Detalii Sedinta Tranzactionare - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/admin_reports/assets_tradesession';
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		var ID_Asset = req.param('id') * 1;
		var asset = req.session.asset;
		if(!asset) return res.send(404);

		restService.select(
			'Journal',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getJournal',
				"objects":
				[
					{
						"Arguments":{
							"ID_Asset": ID_Asset,
							"Since": '1990-01-01'
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view(view,{layout:layout, title:title, items:[], asset: asset});
					},
					function(result){
						//return res.json({Success:true, ResultType:'Array', Result: result.Rows});
						return res.view(view,{layout:layout, title:title, items:result.Rows, asset: asset});
					}
				);
			}
		);
	},

	new_reports_index: function (req, res) {
		var title = 'Rapoarte - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/reports/index';
		var ring = null;
		if(req.param('ring')) {
			ring = req.param('ring') * 1;
		}

		if (req.xhr) {
			var limit = req.param('iDisplayLength') ? req.param('iDisplayLength')*1 : 10;
			var offset = req.param('iDisplayStart')*1+1;
			var cols = ['Name','Code','Ring','isActive'];
			var sort = req.param('iSortCol_0') && typeof cols[req.param('iSortCol_0')] !='undefined' ? cols[req.param('iSortCol_0')] : 'Name';
			//var sort = 'Name';
			var sortDir = req.param('sSortDir_0');
			var total_count = 0;
		restService.select(
			'Ring',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'dashboard',
					"method":'select',
					"procedure":'getAssets',
					"objects":[
						{
							"Arguments":{
								"ID_Market":sails.marketId,
								"ID_Ring": (ring ? ring*1 : -1),
								"anystatus":true,
								"all":true,
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
								var options = '';
								_.each(req.session.reportTypes,function(reportType) {
									options += '<li><a href="/admin/new_reports/view/' + result.Rows[i].ID + '/' + reportType.ReportName +'">' + reportType.ReportName + '</a></li>';
								});

								items.push([
									req.session.getTranslation(result.Rows[i].Name),
									result.Rows[i].Code,
									(toolsService.searchIdInArray(result.Rows[i].ID_Ring,sails.storage.rings)>-1 ? req.session.getTranslation(sails.storage.rings[toolsService.searchIdInArray(result.Rows[i].ID_Ring,sails.storage.rings)]['Name']) : '-'),
									result.Rows[i].isActive ? 'Da' : 'Nu',
									result.Rows[i].MeasuringUnit,
									'<td class="v-align-middle">'+
										'<div class="btn-group">'+
											'<a class="btn btn-small dropdown-toggle btn-primary" data-toggle="dropdown" href="#">Raport <span class="caret"></span> </a>'+
											'<ul class="dropdown-menu">'+
												options +
											'</ul>'+
										'</div>'+
									'</td>'
								]);
							}
							return res.json({sEcho: req.param('sEcho'), iTotalRecords: total_count, iTotalDisplayRecords: total_count, aaData: items});
						}
					);
				}
			);
		}
		else {
			return res.view(view, { layout: layout, title:title, reporttypes:req.session.reportTypes});
		}
	},

	new_reports: function (req, res) {
		var title = 'Rapoarte - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/reports/view';

		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		var ID_Asset = req.param('id') * 1;
		var asset = req.session.asset;
		if(!asset) return res.send(404);
		restService.select(
			'GridReport',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getReportDataSet',
				"objects":
				[
					{
						"Arguments":
						{
							"ID_Asset": ID_Asset,
							"ReportName": req.param('ReportName')
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view(view, { layout: layout, title:title});
					},
					function(result){
						return res.view(view, { layout: layout, title:title, table:result.Columns, data:result.Rows});
					}
				);
			}
		);
	}

};
