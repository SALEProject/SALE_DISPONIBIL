module.exports = {

	index: function(req,res) {
		var title = 'Istoric tranzactii';
		var section = 'transactions';
		var msg = '';
  
		if(req.isSocket) {
		restService.select(
			'Transaction',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getTransactions'
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							if(typeof err == 'string') return res.json({Success:false, ResultType:'GeneralError', Result: err});
							else return res.json(err);
						},
						function(result){
							return res.json({Success:true, ResultType:'Array', Result:result.Rows});
						}
					);
				}
			);
		}
		else {
		restService.select(
			'Transaction',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getTransactions',
					"objects":[
						{
							"Arguments": {
								"Since":'2015-02-01T00:00:00.000'
							}
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view({title:title, section:section, items:[]});
						},
						function(result){
							return res.view({ title:title, section:section, items:result.Rows});
						}
					);
				}
			);
		}
	},

	transactions: function (req, res) {
		var title = 'Tranzactii - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/transactions/transactions';
		restService.select(
			'Transaction',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getTransactions',
				"objects":[
					{
						"Arguments": {
							"all":true
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

	transaction_add: function (req, res) {
		var title = 'Adaugare tranzactie manual - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/transactions/transaction_add';
		if(req.method == 'POST') {
			var moment = require('moment');
			var OrderBuyCreationDate = moment(req.param('OrderBuyCreationDate')+' '+req.param('OrderBuyCreationTime'),'DD MMM YYYY HH:mm:ss');
			var OrderSellCreationDate = moment(req.param('OrderSellCreationDate')+' '+req.param('OrderSellCreationDate'),'DD MMM YYYY HH:mm:ss');
			var TransactionDate = moment(req.param('TransactionDate')+' '+req.param('TransactionTime'),'DD MMM YYYY HH:mm:ss');
		restService.select(
			'Transaction',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'addTransaction',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Ring":req.param('ID_Ring')*1,
								"ID_Asset":req.param('ID_Asset')*1,
								"ID_BuyClient": req.param('ID_BuyClient')*1, // ID_Client
								"ID_SellClient": req.param('ID_SellClient')*1,	//ID_Client
								"ID_AgencyBuy": req.param('ID_AgencyBuy')*1, // ID_Client
								"ID_AgencySell": req.param('ID_AgencySell')*1,	//ID_Client
								"NewOrderSell":req.param('NewOrderSell')==1?true:false,	//new order or existing order
								"NewOrderBuy":req.param('NewOrderBuy')==1?true:false,
								"OrderBuyQuantity":typeof req.param('OrderBuyQuantity')!='undefined' && req.param('OrderBuyQuantity')!='' ? req.param('OrderBuyQuantity').replace(/\./g,'').replace(',','.')*1 : 'none',
								"OrderBuyPrice":typeof req.param('OrderBuyPrice')!='undefined' && req.param('OrderBuyPrice')!='' ? req.param('OrderBuyPrice').replace(/\./g,'').replace(',','.')*1 : 'none',
								"IDOrderBuy":req.param('IDOrderBuy') ? req.param('IDOrderBuy')*1 : -1,
								"IDOrderBuyQuantity":req.param('IDOrderBuyQuantity') ? req.param('IDOrderBuyQuantity')*1 : 0,
								"BuyPosition":req.param('BuyPosition') ? req.param('BuyPosition')*1 : 0,
								"OrderBuyIsPartial":req.param('OrderBuyIsPartial')==1?true:false,
								"OrderBuyCreationDate": OrderBuyCreationDate.format('YYYY-MM-DDTHH:mm:ss.SSS'),
								"OrderSellQuantity":typeof req.param('OrderSellQuantity')!='undefined' && req.param('OrderSellQuantity')!='' ? req.param('OrderSellQuantity').replace(/\./g,'').replace(',','.')*1 : 'none',
								"OrderSellPrice":typeof req.param('OrderSellPrice')!='undefined' && req.param('OrderSellPrice')!='' ? req.param('OrderSellPrice').replace(/\./g,'').replace(',','.')*1 : 'none',
								"IDOrderSell":req.param('IDOrderSell') ? req.param('IDOrderSell')*1 : -1,
								"IDOrderSellQuantity":req.param('IDOrderSellQuantity') ? req.param('IDOrderSellQuantity')*1 : 0,
								"SellPosition":req.param('SellPosition') ? req.param('SellPosition')*1 : 0,
								"OrderSellIsPartial":req.param('OrderSellIsPartial')==1?true:false,
								"OrderSellCreationDate": OrderSellCreationDate.format('YYYY-MM-DDTHH:mm:ss.SSS'),
								"TransactionDate": TransactionDate.format('YYYY-MM-DDTHH:mm:ss.SSS'),
								"TransactionQuantity":typeof req.param('TransactionQuantity')!='undefined' && req.param('TransactionQuantity')!='' ? req.param('TransactionQuantity').replace(/\./g,'').replace(',','.')*1 : 'none',
								"TransactionPrice":typeof req.param('TransactionPrice')!='undefined' && req.param('TransactionPrice')!='' ? req.param('TransactionPrice').replace(/\./g,'').replace(',','.')*1 : 'none'
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
							req.flash('success','Tranzactia a fost adaugata cu succes!');
							return res.redirect('/admin/transactions');
						}
					);
				}
			);
		}
		else return res.view(view,{layout:layout, title:title, item:{}});
	},

	transaction_edit: function (req, res) {
		var title = 'Modificare tranzactie - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/transactions/transaction_add';
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		if(req.method == 'POST') {
		restService.select(
			'Transaction',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'editTransaction',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Transaction":req.param('id')*1,
								"Code":req.param('Code'),
								"Name":req.param('Name'),
								"FiscalCode":req.param('FiscalCode'),
								"RegisterCode":req.param('RegisterCode'),
								"CompanyName":req.param('CompanyName')
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
							req.flash('success','Agentia a fost modificata cu succes!');
							return res.redirect('/admin/transactions');
						}
					);
				}
			);
		}
		else {
		restService.select(
			'Transaction',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getTransactions',
					"objects":[{
						"Arguments":{
							ID_Transaction:req.param('id')*1
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
							var transaction;
							_.each(result.Rows,function(item){
								if(item.ID==req.param('id')) transaction = item; 
							});
							if(!transaction) return res.send(500,'Transaction not found!');
							return res.view(view,{layout:layout, title:title, item:transaction});
						}
					);
				}
			);
		}
	},

	confirm_transaction: function (req,res) {
		if(!req.param('ID_Transaction')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'ID_Transaction\''});
		if(!req.param('ID_Buyer')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'ID_Buyer\''});
		if(!req.param('ID_Seller')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'ID_Seller\''});
		//if(req.method == 'POST') {
			if((req.method == 'POST') || (req.method == 'GET')) {
		restService.select(
			'Transaction',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":"confirmTransaction",
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Transaction": req.param('ID_Transaction')*1,
								"ID_Buyer": req.param('ID_Buyer')*1,
								"ID_Seller": req.param('ID_Seller')
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
};
