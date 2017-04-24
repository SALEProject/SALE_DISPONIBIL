module.exports = {

	warranties: function (req, res) {
		var title = 'Garantii - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/warranties/warranties';
		
		var clientId = null;
		clientId = req.param('ID_Client')*1;
		var assetId = null;
		assetId = req.param('ID_Asset')*1;
		var warrantyTypeId = null;
		warrantyTypeId = req.param('ID_WarrantyType')*1;

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
								"ID_WarrantyType":req.param('ID_WarrantyType')*1,
								"ID_Client":req.param('ID_Client')*1,
								"ID_Asset":req.param('ID_Asset')*1
							}
						}
					]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view(view,{layout:layout, title:title, items:[]});
					},
					function(result){
						return res.view(view,{layout:layout, title:title, items:result.Rows});
					}
				);
			}
		);
	},
  
	warranty_add: function (req, res) {
		var title = 'Adaugare garantie - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/warranties/warranty_add';
		var clientId = null;
		clientId = req.param('client')*1;
		if(req.method == 'POST') {
		restService.select(
			'Warranty',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'addWarranty',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_PaymentType":req.param('ID_PaymentType')*1,
								"WarrantyNumber":req.param('WarrantyNumber'),
								"ID_Agency":(req.param('ID_Agency'))?req.param('ID_Agency'):0,
								"ID_Client":req.param('ID_Client')*1,
								//"ID_Terminal":req.param('ID_Terminal')*1,
								"ID_Asset":req.param('ID_Asset')*1,
								"ID_CreatedByUser":req.session.currentUser.ID,
								"ID_Currency":req.param('ID_Currency')*1,
								"ValueInCurrency":req.session.lang.code == 'EN' ? req.param('ValueInCurrency').replace(/,/g,'')*1 : req.param('ValueInCurrency').replace(/\./g,'').replace(',','.')*1,
								//"ValueInRON":req.param('ValueInRON')*1,
								"ExchangeRate":req.session.lang.code == 'EN' ? req.param('ExchangeRate').replace(/,/g,'')*1 : req.param('ExchangeRate').replace(/\./g,'').replace(',','.')*1,
								"ValabilityStartDate":req.param('ValabilityStartDate')+'T00:00:00.000',
								"ValabilityEndDate":req.param('ValabilityEndDate')+'T00:00:00.000',
								"ExecutionDate":req.param('ExecutionDate')+'T00:00:00.000',
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
							req.flash('success','Garantia a fost adaugata cu succes!');
							if(clientId==null)
								return res.redirect('/admin/warranties');
							else
								return res.redirect('/admin/clients/edit/' + clientId);
						}
					);
				}
			);
		}
		else return res.view(view,{layout:layout, title:title, item:{}});
	},

	warranty_edit: function (req, res) {
		var title = 'Modificare garantie - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/warranties/warranty_add';
		var clientId = null;
		clientId = req.param('client')*1;
		
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		if(req.method == 'POST') {
		restService.select(
			'Warranty',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'editWarranty',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_BOperation":req.param('id')*1,
								"ID_PaymentType":req.param('ID_PaymentType')*1,
								"WarrantyNumber":req.param('WarrantyNumber'),
								"ID_Agency":(req.param('ID_Agency'))?req.param('ID_Agency'):0,
								"ID_Client":req.param('ID_Client')*1,
								//"ID_Terminal":req.param('ID_Terminal')*1,
								"ID_Asset":req.param('ID_Asset')*1,
								"ID_CreatedByUser":req.session.currentUser.ID,
								"ID_Currency":req.param('ID_Currency')*1,
								"ValueInCurrency":req.param('ValueInCurrency')*1,
								//"ValueInRON":req.param('ValueInRON')*1,
								"ExchangeRate":req.param('ExchangeRate')*1,
								"ValabilityStartDate":req.param('ValabilityStartDate')+'T00:00:00.000',
								"ValabilityEndDate":req.param('ValabilityEndDate')+'T00:00:00.000',
								"ExecutionDate":req.param('ExecutionDate')+'T00:00:00.000',
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
							req.flash('success','Garantia a fost modificata cu succes!');
							if(clientId==null)
								return res.redirect('/admin/warranties');
							else
								return res.redirect('/admin/clients/edit/' + clientId);
						}
					);
				}
			);
		}
		else {
		restService.select(
			'Warranty',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getWarranties',
					"objects":[{
						"Arguments":{
							ID_BOperation:req.param('id')*1
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
							var warranty;
							_.each(result.Rows,function(item){
								if(item.ID==req.param('id')) warranty = item; 
							});
							if(!warranty) return res.send(500,'Warranty not found!');
							return res.view(view,{layout:layout, title:title, item:warranty});
						}
					);
				}
			);
		}
	},

	warranty_delete: function (req, res) {
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		restService.select(
			'Warranty',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"procedure":'deleteWarranty',
				"service":'/BRMWrite.svc',
				"objects":[
					{
						"Arguments":{
							"ID_BOperation":req.param('id')*1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.redirect('/admin/warranties');
					},
					function(result){
						req.flash('success','Garantia a fost stersa cu succes!');
						return res.redirect('/admin/warranties');
					}
				);
			}
		);
	},

	//20150715
	warranties_buffer: function (req, res) {
		var title = 'Buffer Tranzactii - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/warranties/warranties_buffer';
		restService.select(
			'Warranty',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getOperationsBuffer'
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view(view,{layout:layout, title:title, items:[]});
					},
					function(result){
						return res.view(view,{layout:layout, title:title, items:result.Rows});
					}
				);
			}
		);
	},

	warranties_buffer_edit: function (req, res) {
		var title = 'Modificare garantie - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/warranties/warranty_buffer_edit';
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		if(req.method == 'POST') {
		restService.select(
			'Warranty',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'addWarranty',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_PaymentType":req.param('ID_PaymentType')*1,
								"WarrantyNumber":req.param('WarrantyNumber'),
								"ID_Agency":(req.param('ID_Agency'))?req.param('ID_Agency'):0,
								"ID_Client":req.param('ID_Client')*1,
								//"ID_Terminal":req.param('ID_Terminal')*1,
								"ID_Asset":req.param('ID_Asset')*1,
								"ID_CreatedByUser":req.session.currentUser.ID,
								"ID_Currency":req.param('ID_Currency')*1,
								"ValueInCurrency":req.param('ValueInCurrency')*1,
								//"ValueInRON":req.param('ValueInRON')*1,
								"ExchangeRate":req.param('ExchangeRate')*1,
								"ValabilityStartDate":req.param('ValabilityStartDate')+'T00:00:00.000',
								"ValabilityEndDate":req.param('ValabilityEndDate')+'T00:00:00.000',
								"ExecutionDate":req.param('ExecutionDate')+'T00:00:00.000',
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
							
		restService.select(
			'Warranty',
								{
									"SessionId":sessionService.getSessionID(req),
									"currentState":'dashboard',
									"method":'execute',
									"procedure":'editOperationsBuffer',
									"service":'/BRMWrite.svc',
									"objects":[
										{
											"Arguments":{
												"ID_BO_OperationBuffer":req.param('id')*1
											}
										}
									]
								},
								function(error,response) {
									return parserService.parse(error,response,
										function(err){
											req.flash('error',err);
											return res.view(view,{layout:layout, title:title, items:[]});
										},
										function(result){
											req.flash('success','Tranzactia a fost transformata in garantie!');
											return res.redirect('/admin/warranties/buffer');
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
			console.log('a intrat bine');
		restService.select(
			'Warranty',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getOperationsBuffer',
					"objects":[{
						"Arguments":{
							ID_BOperationBuffer:req.param('id')*1
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
							var warranty;
							_.each(result.Rows,function(item){
								if(item.ID==req.param('id')) warranty = item; 
							});
							if(!warranty) return res.send(500,'Warranty not found!');
							return res.view(view,{layout:layout, title:title, item:warranty});
						}
					);
				}
			);
		}
	},
	//---------
};
