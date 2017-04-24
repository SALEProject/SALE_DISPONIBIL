module.exports = {

	index: function (req, res) {
		var start = Date.now();
		if(!req.param('ID_Ring')) return res.json({Success:false, ResultType:'GeneralError', Result: 'missing parameter \'ID_Ring\''});

		var arguments = {
			"ID_Market": sails.config.marketId,
			"ID_Ring": req.param('ID_Ring')*1
		};
		if(req.param('ID_Asset')) {
			arguments.ID_Asset = req.param('ID_Asset')*1
		}
		restService.select(
			'Ring',
			{
				"SessionId":sessionService.getSessionID(req),
	 			"currentState":'login',
				"method":'select',
				"procedure":'getAssets',
				"objects": [
					{
						"Arguments": arguments
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
						for(var i=0;i<result.Rows.length;i++) {
							result.Rows[i].Name = req.session.getTranslation(result.Rows[i].Name);
							result.Rows[i].Description = req.session.getTranslation(result.Rows[i].Description);
						}
						console.log('get assets: '+(Date.now()-start));
						return res.json({Success:true, ResultType:'Array', Result: result.Rows});
					}
				);
			}
		);
	},

	assetsession: function (req, res) {
		if(!req.param('ID_Ring')) return res.json({Success:false, ResultType:'GeneralError', Result: 'missing parameter \'ID_Ring\''});
		if(!req.param('ID_Asset')) return res.json({Success:false, ResultType:'GeneralError', Result: 'missing parameter \'ID_Asset\''});

		var start = Date.now();
		restService.select(
			'RingSession',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getTradingSessionStats',
				"objects": [
					{
						"Arguments": {
							"ID_Market": sails.marketId,
							"ID_Ring": req.param('ID_Ring')*1,
							"ID_Asset": req.param('ID_Asset')*1
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
						for(var i=0;i<result.Rows.length;i++) {
							result.Rows[i].Name = req.session.getTranslation(result.Rows[i].Name);
						}
						console.log('get asset session: '+(Date.now()-start));

						return res.json({Success:true, ResultType:'Array', Result: result.Rows});
					}
				);
			}
		);
	},

	clients: function (req, res) {
		if(!req.param('ID_Ring')) return res.json({Success:false, ResultType:'GeneralError', Result: 'missing parameter \'ID_Ring\''});
		if(!req.param('ID_Asset')) return res.json({Success:false, ResultType:'GeneralError', Result: 'missing parameter \'ID_Asset\''});

		var start = Date.now();
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
							"ID_Market": sails.marketId,
							"ID_Ring": req.param('ID_Ring')*1,
							"ID_Asset": req.param('ID_Asset')*1
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
						console.log('get assets: '+(Date.now()-start));
						return res.json({Success:true, ResultType:'Array', Result: result.Rows});
					}
				);
			}
		);
	},

	documents: function (req, res) {
		if(!req.param('ID_Asset')) return res.json({Success:false, ResultType:'GeneralError', Result: 'missing parameter \'ID_Asset\''});

		restService.select(
			'Document',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getDocuments',
				"objects": [
					{
						"Arguments": {
							"ID_Asset": req.param('ID_Asset')*1
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
						for(var i=0;i<result.Rows.length;i++) {
							result.Rows[i].DocumentType = req.session.getTranslation(result.Rows[i].DocumentType);
						}
						return res.json({Success:true, ResultType:'Array', Result: result.Rows});
					}
				);
			}
		);
	},

	assets: function (req, res) {
		var title = 'Active - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/assets/assets';
		var ring = null;
		var assetType = null;
		if(req.param('ring')) {
			var ring_id = req.param('ring');
			ring = toolsService.getArrayItem(sails.storage.rings,ring_id);
		}
		if(req.param('asset_type')) {
			var assetType_id = req.param('asset_type');
			assetType = toolsService.getArrayItem(sails.storage.assetTypes,assetType_id);
		}
		if (req.xhr) {
			var limit = req.param('iDisplayLength') ? req.param('iDisplayLength')*1 : 10;
			var offset = req.param('iDisplayStart')*1+1;
			var cols = ['Name','Code','Ring','isActive','isElectronicSession','Direction','ClientName','ExpirationDate'];
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
								"ID_Ring": (ring ? ring.ID : -1),
								"ID_AssetType": (assetType ? assetType.ID : -1),
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
									result.Rows[i].isElectronicSession ? 'Da' : 'Nu',
									result.Rows[i].AuctionType == 'double' ? 'Dublu competitiva' : (result.Rows[i].Direction=='B' ? 'Cumparare' : 'Vanzare'),
									result.Rows[i].ID_InitialOrder ? result.Rows[i].ClientName + (result.Rows[i].ClientCode ? ' (' + result.Rows[i].ClientCode + ')' : ''): '-',
									result.Rows[i].ExpirationDate ? timeService.formatDate(result.Rows[i].ExpirationDate,'DD MMM YYYY') : '-',
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
								'</td>',
								'<td><a href="/admin/assets/duplicate/' + result.Rows[i].ID + '" class="action-icon btn btn-small btn-demo-space" title="Duplica ordin"><i class="fa fa-external-link"></i></a></td>',
								'<td><a href="/admin/assets/edit/' + result.Rows[i].ID + '" class="action-icon btn btn-small btn-success" title="Editeaza"><i class="fa fa-edit"></i></a></td>',
								'<td><a href="/admin/assets/delete/' + result.Rows[i].ID + '" title="Sterge" class="action-icon delete-confirm btn btn-small btn-danger"><i class="fa fa-trash-o"></i></a></td>'
								]);
							}

              return res.json({sEcho: req.param('sEcho'), iTotalRecords: total_count, iTotalDisplayRecords: total_count, aaData: items});
						}
					);
				}
			);
		}
		else {
			return res.view(view,{layout:layout, title:title, items:[], ring:ring, assetType:assetType});
		}
	},

	search_assets: function (req, res) {
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
							"ID_Market": sails.marketId,
							"all":true,
							"anystatus": true,
							"SortField": "Name",
							"SortOrder": "asc",
							"QueryKeyword":req.param('search') ? req.param('search') : null,
							"QueryLimit":20
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
							items.push({
								id: result.Rows[i].ID,
								text: result.Rows[i].NameTR
							});
						}
						return res.json({more:false, results: items});
					}
				);
			}
		);
	},

	/*
	assets_table_json: function (req, res) {
		var ring = null;
		var assetType = null;
		if(req.param('ring')) {
			var ring_id = req.param('ring');
			ring = toolsService.getArrayItem(sails.storage.rings,ring_id);
		}
		if(req.param('asset_type')) {
			var assetType_id = req.param('asset_type');
			assetType = toolsService.getArrayItem(sails.storage.assetTypes,assetType_id);
		}
	},
	*/

	asset_save: function (req, res) {
		var title = 'Activ - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/assets/asset_save';
		var at = sails.storage.assetTypes;
		var ring = null;
		var assetType = null;
		for(var i=0;i<at.length;i++) {
			at[i].Name = req.session.getTranslation(at[i].Name);
			at[i].Name_EN = toolsService.getLangTranslation(at[i].Name,'EN');
			at[i].Name_RO = toolsService.getLangTranslation(at[i].Name,'RO');
		}
		if(req.param('id')) {
			var asset_id = req.param('id');
			title = 'Modificare activ - Panou de control - '+sails.config.appName;
			if(req.method == 'POST') {
				var arguments = {
					"ID_Asset":req.param('id')*1,
					"ID_Market":sails.marketId,
					"ID_Ring":req.param('ID_Ring')*1,
					"ID_AssetType":req.param('ID_AssetType')*1,
					"Code":req.param('Code'),
					"AuctionType":req.param('AuctionType'),
					"Name_RO":req.param('Name_RO'),
					"Name_EN":req.param('Name_EN'),
					"Description_RO":req.param('Description_RO'),
					"Description_EN":req.param('Description_EN'),
					"ID_MeasuringUnit":req.param('ID_MeasuringUnit')*1,
					"ID_Currency":req.param('ID_Currency')*1,
					"ID_PaymentCurrency":req.param('ID_PaymentCurrency')*1,
					"ID_Terminal":req.param('ID_Terminal') ? req.param('ID_Terminal')*1 : null,
					"Visibility":req.param('Visibility'),
					"SpotQuotation": req.param('SpotQuotation') ? req.param('SpotQuotation')*1 : 0,
					"isSpotContract":(req.param('isSpotContract')=='1'?true:false),
					"isActive":true,
					"isDefault":false,
					"Instructions_RO":req.param('Instructions_RO'),
					"Instructions_EN":req.param('Instructions_EN'),
					"DeliveryTerm":req.param('DeliveryTerm'),
					"DeliveryConditions":req.param('DeliveryConditions'),
					"PackingMethod":req.param('PackingMethod'),
					"PaymentMethod":req.param('PaymentMethod'),
					"ContractTerm":req.param('ContractTerm'),
					"WarrantyMethod":req.param('WarrantyMethod')
				};
				if(req.param('AuctionType')=='double') {
					arguments.ID_InitialOrder = 0;
				}
				req.body.ID = req.param('id')*1;
		restService.select(
			'Asset',
					{
						"SessionId":sessionService.getSessionID(req),
						"currentState":'login',
						"method":'execute',
						"procedure":'editAsset',
						"service":'/BRMWrite.svc',
						"objects":[
							{
								"Arguments": arguments
							}
						]
					},
					function(error,response) {
						return parserService.parse(error,response,
							function(err){
								req.flash('error',err);
								return res.view(view,{layout:layout, title:title, item:req.body, at:at, ring:ring, assetType:assetType});
							},
							function(result){
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
													"ID_Asset":req.param('id')*1,
													"ID_Market":sails.marketId
												}
											}]
										},
										function(error,response) {
											return parserService.parse(error,response,
												function(err){
													req.flash('error',err);
													return res.view(view,{layout:layout, title:title, item:req.body, at:at, ring:ring, assetType:assetType});
												},
												function(result){
													toolsService.parseValidation(result,req);
													return res.view(view,{layout:layout, title:title, item:req.body, at:at, ring:ring, assetType:assetType});
												}
											);
										}
									);
								}
								else {
									eventService.getTranslations(function() {
										if(req.param('AuctionType')=='double') return res.redirect('/admin/asset_schedules/schedules?asset='+asset_id);
										else return res.redirect('/admin/orders/initial?asset='+asset_id);
									});
								}
							}
						);
					}
				);
			}
			else {
		restService.select(
			'Ring',
					{
						"SessionId":sessionService.getSessionID(req),
						"currentState":'dashboard',
						"method":'select',
						"procedure":'getAssetsDetailed',
						"objects":[{
							"Arguments":{
								"ID_Asset":asset_id*1,
								"ID_Market":sails.marketId,
								"all":true,
								"anystatus":true
							}
						}]
					},
					function(error,response) {
						return parserService.parse(error,response,
							function(err){
								req.flash('error',err);
								return res.view(view,{layout:layout, title:title, item:req.body, at:at, ring:ring, assetType:assetType});
							},
							function(result){
								console.lo
								var found_item;
								_.each(result.Rows,function(item){
									if(item.ID==asset_id) found_item = item;
								});
								if(!found_item) return res.send(500,'Asset not found!');
								return res.view(view,{layout:layout, title:title, item:found_item, at:at, ring:ring, assetType:assetType});
							}
						);
					}
				);
			}
		}
		else {
			title = 'Adaugare activ - Panou de control - '+sails.config.appName;
			if(req.param('asset_type')) {
				var assetType = toolsService.getArrayItem(sails.storage.assetTypes,req.param('asset_type')*1);
			}
			if(req.param('ring')) {
				ring = toolsService.getArrayItem(sails.storage.rings,req.param('ring')*1);
			}
			if(req.method == 'POST') {
				var arguments = {
					"ID_Market":sails.marketId,
					"ID_Ring":req.param('ID_Ring')*1,
					"ID_AssetType":req.param('ID_AssetType')*1,
					"Code":req.param('Code'),
					"AuctionType":req.param('AuctionType'),
					"Name_RO":req.param('Name_RO'),
					"Name_EN":req.param('Name_EN'),
					"Description_RO":req.param('Description_RO'),
					"Description_EN":req.param('Description_EN'),
					"ID_MeasuringUnit":req.param('ID_MeasuringUnit')*1,
					"ID_Currency":req.param('ID_Currency')*1,
					"ID_PaymentCurrency":req.param('ID_PaymentCurrency')*1,
					"ID_Terminal":req.param('ID_Terminal') ? req.param('ID_Terminal')*1 : null,
					"Visibility":req.param('Visibility'),
					"SpotQuotation": req.param('SpotQuotation') ? req.param('SpotQuotation')*1 : 0,
					"isSpotContract":(req.param('isSpotContract')=='1'?true:false),
					"isActive":true,
					"isDefault":false,
					"Instructions_RO":req.param('Instructions_RO'),
					"Instructions_EN":req.param('Instructions_EN'),
					"DeliveryTerm":req.param('DeliveryTerm'),
					"DeliveryConditions":req.param('DeliveryConditions'),
					"PackingMethod":req.param('PackingMethod'),
					"PaymentMethod":req.param('PaymentMethod'),
					"ContractTerm":req.param('ContractTerm'),
					"WarrantyMethod":req.param('WarrantyMethod')
				};
		restService.select(
			'Asset',
					{
						"SessionId":sessionService.getSessionID(req),
						"currentState":'login',
						"method":'execute',
						"procedure":'addAsset',
						"service":'/BRMWrite.svc',
						"objects":[
							{
								"Arguments": arguments
							}
						]
					},
					function(error,response) {
						return parserService.parse(error,response,
							function(err){
								req.flash('error',err);
								return res.view(view,{layout:layout, title:title, item:req.body, at:at, ring:ring, assetType:assetType});
							},
							function(result){
								//var sleep = require('sleep');
								//sleep.sleep(1);
								eventService.getTranslations(function() {
									if(typeof result == 'object') var asset_id = result.ID_Asset;
									else var asset_id = result;
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
														"ID_Asset":asset_id*1,
														"ID_Market":sails.marketId
													}
												}]
											},
											function(error,response) {
												return parserService.parse(error,response,
													function(err){
														req.flash('error',err);
														return res.redirect('/admin/assets/edit/'+asset_id);
														//return res.view(view,{layout:layout, title:title, item:req.body, at:at, ring:ring, assetType:assetType});
													},
													function(result){
														toolsService.parseValidation(result,req);
														return res.redirect('/admin/assets/edit/'+asset_id);
														//return res.view(view,{layout:layout, title:title, item:req.body, at:at, ring:ring, assetType:assetType});
													}
												);
											}
										);
									}
									else {
										if(req.param('AuctionType')=='double') return res.redirect('/admin/asset_schedules/schedules?asset='+asset_id);
										else return res.redirect('/admin/orders/initial?asset='+asset_id);
									}
								});
							}
						);
					}
				);
			}
			else return res.view(view,{layout:layout, title:title, item:{}, at:at, ring:ring, assetType:assetType});
		}
	},
	asset_delete: function (req, res) {
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		restService.select(
			'Asset',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"procedure":'deleteAsset',
				"service":'/BRMWrite.svc',
				"objects":[
					{
						"Arguments":{
							"ID_Asset":req.param('id')*1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.redirect('/admin/assets');
					},
					function(result){
						req.flash('success','Activul a fost sters cu succes!');
						return res.redirect('/admin/assets');
					}
				);
			}
		);
	},

	setWarrantyType2Asset: function (req,res) {
		if(!req.param('asset_id')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'asset_id\''});
		if(!req.param('warrantytype_id')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'warrantytype_id\''});
		if(!req.param('isSet')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'isSet\''});
		if(req.method == 'POST') {
		restService.select(
			'Asset',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":"setWarrantyType2Asset",
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Asset": req.param('asset_id')*1,
								"ID_WarrantyType": req.param('warrantytype_id')*1,
								"isDeleted": (req.param('isSet')=='true'?false:true),
							}
						}
					]
				},
				function(error,result) {
				  if (error) {
					if(error.hasOwnProperty('name') && error.name=='ConnectTimeoutError') message = 'Connection timeout. Please try again later.';
					else message = error;
					return res.json({Success:false,ResultType:'GeneralError',Result:message});
				  } else {
					toolsService.parseResponse(result,function(msg) {
						return res.json(result);
					},
					function(resultObject) {
						return res.json({Success:true});
					});
				  }
			});
		}
		else return res.json({Success:false,ResultType:'GeneralError',Result:'no post data!'});
	},

	setWarrantyType2AssetPriority: function (req,res) {
		if(!req.param('ID_Asset')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'ID_Asset\''});
		if(!req.param('ID_WarrantyType')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'ID_WarrantyType\''});
		if(!req.param('Offset')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'Offset\''});
		//if(req.method == 'POST') {
			if((req.method == 'POST') || (req.method == 'GET')) {
		restService.select(
			'Asset',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":"setWarrantyTypePriority",
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Asset": req.param('ID_Asset')*1,
								"ID_WarrantyType": req.param('ID_WarrantyType')*1,
								"Offset": req.param('Offset')*1
							}
						}
					]
				},
				function(error,result) {
				  if (error) {
					if(error.hasOwnProperty('name') && error.name=='ConnectTimeoutError') message = 'Connection timeout. Please try again later.';
					else message = error;
					return res.json({Success:false,ResultType:'GeneralError',Result:message});
				  } else {
					toolsService.parseResponse(result,function(msg) {
						return res.json(result);
					},
					function(resultObject) {
						return res.json({Success:true});
					});
				  }
			});
		}
		else return res.json({Success:false,ResultType:'GeneralError',Result:'no post data!'});
	},

	trade_parameters: function (req, res) {
		var title = 'Parametri tranzactionare - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/assets/trade_parameters';
		var asset = null;
		var asset_type = null;
		var ring = null;
		if(req.param('asset')) {
			var asset = req.session.asset;
			if(asset) {
				asset = req.session.asset;
				asset_type = sails.storage.assetTypes[toolsService.searchIdInArray(asset.ID_AssetType,sails.storage.assetTypes)];
				ring = sails.storage.rings[toolsService.searchIdInArray(asset.ID_Ring,sails.storage.rings)];
			}
			else {
				req.flash('error','Activul nu a fost gasit!');;
			}
		}
		if(req.method == 'POST') {
			var arguments = {
				"ID_Asset":req.param('ID_Asset')*1,
				"SellWarrantyPercent":req.param('SellWarrantyPercent')!='' ? req.param('SellWarrantyPercent').replace(/\./g,'').replace(',','.')*1 : 'none',
				"BuyWarrantyPercent":req.param('BuyWarrantyPercent')!='' ? req.param('BuyWarrantyPercent').replace(/\./g,'').replace(',','.')*1 : 'none',
				"SellWarrantyMU":req.param('SellWarrantyMU')!='' ? req.param('SellWarrantyMU').replace(/\./g,'').replace(',','.')*1 : 'none',
				"BuyWarrantyMU":req.param('BuyWarrantyMU')!='' ? req.param('BuyWarrantyMU').replace(/\./g,'').replace(',','.')*1 : 'none',
				"SellWarrantyFixed":req.param('SellWarrantyFixed')!='' ? req.param('SellWarrantyFixed').replace(/\./g,'').replace(',','.')*1 : 'none',
				"BuyWarrantyFixed":req.param('BuyWarrantyFixed')!='' ? req.param('BuyWarrantyFixed').replace(/\./g,'').replace(',','.')*1 : 'none',
			};
			for(var i =0;i<req.session.params.length;i++) {
				arguments[req.session.params[i].label] = (req.param(req.session.params[i].label)=='1'?true:false);
			}
			arguments["DifferentialPriceText"] = req.param('DifferentialPriceText');
		restService.select(
			'Asset',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'setAssetTradeParameters',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments": arguments
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view(view,{layout:layout, title:title, item:req.body, asset:asset});
						},
						function(result){
							if(req.param('Validate')=='1') {
								//var asset = req.body;
		restService.select(
			'Ring',
									{
										"SessionId":sessionService.getSessionID(req),
										"currentState":'dashboard',
										"method":'select',
										"procedure":'validate',
										"objects":[{
											"Arguments":{
												"ID_Asset":req.param('ID_Asset')*1,
												"ID_Market":sails.marketId
											}
										}]
									},
									function(error,response) {
										return parserService.parse(error,response,
											function(err){
												req.flash('error',err);
												return res.view(view,{layout:layout, title:title, item:req.body, asset:asset});
											},
											function(result){
												toolsService.parseValidation(result,req);
												return res.view(view,{layout:layout, title:title, item:req.body, asset:asset});
											}
										);
									}
								);
							}
							else {
								return res.redirect('/admin/clients/asset_clients?asset='+req.param('ID_Asset'));
							}
						}
					);
				}
			);
		}
		else {
			var item = {};
			if(ring.SellWarrantyPercent) item.SellWarrantyPercent = ring.SellWarrantyPercent;
			if(ring.BuyWarrantyPercent) item.BuyWarrantyPercent = ring.BuyWarrantyPercent;
			if(ring.SellWarrantyMU) item.SellWarrantyMU = ring.SellWarrantyMU;
			if(ring.BuyWarrantyMU) item.BuyWarrantyMU = ring.BuyWarrantyMU;
			if(ring.SellWarrantyFixed) item.SellWarrantyFixed = ring.SellWarrantyFixed;
			if(ring.BuyWarrantyFixed) item.BuyWarrantyFixed = ring.BuyWarrantyFixed;
			for(var i=0;i<req.session.params.length;i++) {
				item[req.session.params[i].label] = asset_type[req.session.params[i].label];
			}
			item.DifferentialPriceText = asset_type.DifferentialPriceText;
		restService.select(
			'Ring',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getAssetTradeParameters',
					"objects":[{
						"Arguments":{
							"ID_Market":sails.marketId,
							"ID_Asset":req.param('asset')*1
						}
					}]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view(view,{layout:layout, title:title, item:item});
						},
						function(result){
							if(result.Rows.length>0) {
								//console.log(result.Rows[0]);
								return res.view(view,{layout:layout, title:title, asset:asset, item:result.Rows[0]});
							}
							else {
								return res.view(view,{layout:layout, title:title, asset:asset, item:item});
							}
						}
					);
				}
			);
		}
	},

	save_parameters: function (req, res) {
		if(!req.param('ID_Asset')) return res.json({Success:false, ResultType:'GeneralError', Result: 'missing parameter \'ID_Asset\''});
		if(req.session.assetSchedules.length>0) {
			var asset = req.session.assetSchedules[0];
		}
		else {
			return res.json({Success:false, ResultType:'GeneralError', Result: 'asset not found'});
		}
		if(req.method == 'POST') {
			var moment = require('moment');
			var startDate = moment(req.param('StartDate'),'DD MMM YYYY');
			var endDate = moment(req.param('EndDate'),'DD MMM YYYY');
			var arguments = {
				"ID_Asset":req.param('ID_Asset')*1,
				"ID_AssetSchedule":asset.ID,
				"PreOpeningTime":req.param('PreOpeningTime') ? req.param('PreOpeningTime') : '00:00:00',
				"OpeningTime":req.param('OpeningTime') ? req.param('OpeningTime') : '00:00:00',
				"PreClosingTime":req.param('PreClosingTime') ? req.param('PreClosingTime') : '00:00:00',
				"ClosingTime":req.param('ClosingTime') ? req.param('ClosingTime') : '00:00:00',
				"isActive":true,
				//"isElectronicSession":(req.param('isElectronicSession')=='1'?true:false),
				//"launchAutomatically":(req.param('launchAutomatically')=='1'?true:false),
				"StartDate":startDate.format('YYYY-MM-DDTHH:mm:ss.SSS'),
				"EndDate":endDate.format('YYYY-MM-DDTHH:mm:ss.SSS'),
				"DeltaT":req.param('DeltaT')*1,
				"DeltaT1":req.param('DeltaT1')*1,
				"QuantityStepping":req.param('QuantityStepping')!='' ? req.param('QuantityStepping').replace(/\./g,'').replace(',','.')*1 : 'none',
				"MinQuantity":req.param('MinQuantity')!=''? req.param('MinQuantity').replace(/\./g,'').replace(',','.')*1 : 'none',
				"PriceStepping":req.param('PriceStepping')!='' ? req.param('PriceStepping').replace(/\./g,'').replace(',','.')*1 : 'none',
				"MaxPriceVariation":req.param('MaxPriceVariation')!='' ? req.param('MaxPriceVariation').replace(/\./g,'').replace(',','.')*1 : 'none',
				"MinPrice":typeof req.param('MinPrice')!='undefined' && req.param('MinPrice')!='' ? req.param('MinPrice').replace(/\./g,'').replace(',','.')*1 : 'none',
				"MaxPrice":typeof req.param('MaxPrice')!='undefined' && req.param('MaxPrice')!='' ? req.param('MaxPrice').replace(/\./g,'').replace(',','.')*1 : 'none',
				"DaysOfWeek":{
					"dayMonday":req.param('DaysOfWeek_dayMonday')==1?true:false,
					"dayTuesday":req.param('DaysOfWeek_dayTuesday')==1?true:false,
					"dayWednesday":req.param('DaysOfWeek_dayWednesday')==1?true:false,
					"dayThursday":req.param('DaysOfWeek_dayThursday')==1?true:false,
					"dayFriday":req.param('DaysOfWeek_dayFriday')==1?true:false,
					"daySaturday":req.param('DaysOfWeek_daySaturday')==1?true:false,
					"daySunday":req.param('DaysOfWeek_daySunday')==1?true:false,
				},
				"isDefault":false
			};
		restService.select(
			'Asset',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'editAssetSchedule',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments": arguments
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							return res.json({Success:false, ResultType:'GeneralError', Result: err});
						},
						function(result){
							var arguments2 = {
								"ID_Asset":req.param('ID_Asset')*1,
								"SellWarrantyPercent":req.param('SellWarrantyPercent')!='' ? req.param('SellWarrantyPercent').replace(/\./g,'').replace(',','.')*1 : 'none',
								"BuyWarrantyPercent":req.param('BuyWarrantyPercent')!='' ? req.param('BuyWarrantyPercent').replace(/\./g,'').replace(',','.')*1 : 'none',
								"SellWarrantyMU":req.param('SellWarrantyMU')!='' ? req.param('SellWarrantyMU').replace(/\./g,'').replace(',','.')*1 : 'none',
								"BuyWarrantyMU":req.param('BuyWarrantyMU')!='' ? req.param('BuyWarrantyMU').replace(/\./g,'').replace(',','.')*1 : 'none',
								"SellWarrantyFixed":req.param('SellWarrantyFixed')!='' ? req.param('SellWarrantyFixed').replace(/\./g,'').replace(',','.')*1 : 'none',
								"BuyWarrantyFixed":req.param('BuyWarrantyFixed')!='' ? req.param('BuyWarrantyFixed').replace(/\./g,'').replace(',','.')*1 : 'none',
							};
							for(var i =0;i<req.session.params.length;i++) {
								arguments2[req.session.params[i].label] = (req.param(req.session.params[i].label)=='1'?true:false);
							}
							arguments2["DifferentialPriceText"] = req.param('DifferentialPriceText');
		restService.select(
			'Asset',
								{
									"SessionId":sessionService.getSessionID(req),
									"currentState":'login',
									"method":'execute',
									"procedure":'setAssetTradeParameters',
									"service":'/BRMWrite.svc',
									"objects":[
										{
											"Arguments": arguments2
										}
									]
								},
								function(error,response) {
									return parserService.parse(error,response,
										function(err){
											return res.json({Success:false, ResultType:'GeneralError', Result: err});
										},
										function(result){
											return res.json({Success:true, ResultType:'String', Result: 'OK'});
										}
									);
								}
							);
						}
					);
				}
			);
		}
		else {
			return res.json({Success:false, ResultType:'GeneralError', Result: 'bad request method'});
		}
	},

	parameters: function (req, res) {
		if(!req.param('ID_Asset')) return res.json({Success:false, ResultType:'GeneralError', Result: 'missing parameter \'ID_Asset\''});
		if(req.session.assetSchedules.length>0) {
			var asset = req.session.assetSchedules[0];
		}
		else {
			return res.json({Success:false, ResultType:'GeneralError', Result: 'asset not found'});
		}
		restService.select(
			'Ring',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getAssetTradeParameters',
				"objects":[{
					"Arguments":{
						"ID_Market":sails.marketId,
						"ID_Asset":req.param('ID_Asset')*1
					}
				}]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						return res.json({Success:false, ResultType:'GeneralError', Result: err});
					},
					function(result){
						if(result.Rows.length>0) {
							for(var i in result.Rows[0]) {
								asset[i] = result.Rows[0][i];
							}
							return res.json({Success:true, ResultType:'Array', Result: asset});
						}
						else {
							return res.json({Success:false, ResultType:'GeneralError', Result: 'asset session not found'});
						}
					}
				);
			}
		);
	},
	//alex
	duplicate: function (req, res) {
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		restService.select(
			'Asset',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"procedure":'duplicateAsset',
				"service":'/BRMWrite.svc',
				"objects":[
					{
						"Arguments":{
							"ID_Asset":req.param('id')*1,
							"ID_Market":sails.marketId,
							"all":true,
							"anystatus":true
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.redirect('/admin/assets');
					},
					function(result){
						req.flash('success','Activul a fost duplicat cu succes!');
						if(typeof result == 'object' && typeof result.ID_Asset != 'undefined') {
							return res.redirect('/admin/assets/edit/'+result.ID_Asset);
						}
						else {
							return res.redirect('/admin/assets');
						}
					}
				);
			}
		);
	},

	//alex
	assets_json: function (req, res) {
		if(!req.param('ID_Ring')) {
      return res.json({Success:false, ResultType:'GeneralError', Result: 'missing parameter \'ID_Ring\''});
    }

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
              //"ID_Ring": req.param('ID_Ring')*1,
              "anystatus":true,
              "all":true
            }
          }
        ]
      },
      function(error,response) {
        return parserService.parse(error, response,
          function (err) {
            if (typeof err == 'string') return res.json({Success: false, ResultType: 'GeneralError', Result: err});
            else return res.json(err);
          },
          function (result) {
            var events = [];

            result.Rows.forEach(function (item) {
              var expiration = new Date(item.ExpirationDate),
                now = new Date();

              if (expiration >= now) {
                events.push({
                  id: item.ID,
                  title: item.NameTR,
                  start: now,
                  end: expiration
                })
              }
            });

            return res.json({Success:true, ResultType:'Array', Result: events});
          })
      });
	}
};

