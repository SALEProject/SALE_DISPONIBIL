module.exports = {

	document_types: function (req, res) {
		var title = 'Tip Document - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/document_types/document_types';
		restService.select(
			'Document',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getDocumentTypes'
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
  
  
	document_type_add: function (req, res) {
		var title = 'Adaugare tip document - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/document_types/document_type_add';
		if(req.method == 'POST') {
		restService.select(
			'Document',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'addDocumentType',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"Code":req.param('Code'),
								"Name_RO":req.param('Name_RO'),								
								"Name_EN":req.param('Name_EN')								
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
							//var sleep = require('sleep');
							//sleep.sleep(1);
							eventService.getTranslations(function() {
								req.flash('success','Tipul de document a fost adaugat cu succes!');
								return res.redirect('/admin/document_types');
							});
						}
					);
				}
			);
		}
		else return res.view(view,{layout:layout, title:title, item:{}});
	},

	document_type_edit: function (req, res) {
		var title = 'Modificare tip document - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/document_types/document_type_add';
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		if(req.method == 'POST') {
		restService.select(
			'Document',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'editDocumentType',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_DocumentType":req.param('id')*1,
								"Code":req.param('Code'),
								"Name_RO":req.param('Name_RO'),								
								"Name_EN":req.param('Name_EN')								
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
							//var sleep = require('sleep');
							//sleep.sleep(1);
							eventService.getTranslations(function() {
								req.flash('success','Tipul de document a fost modificat cu succes!');
								return res.redirect('/admin/document_types');
							});
						}
					);
				}
			);
		}
		else {
		restService.select(
			'Document',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getDocumentTypes',
					"objects":[{
						"Arguments":{
							ID_DocumentType:req.param('id')*1
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
							var documentType;
							_.each(result.Rows,function(item){
								if(item.ID==req.param('id')) documentType = item; 
							});
							if(!documentType) return res.send(500,'Document type not found!');
							return res.view(view,{layout:layout, title:title, item:documentType});
						}
					);
				}
			);
		}
	},

	document_type_delete: function (req, res) {
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		restService.select(
			'Document',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"procedure":'deleteDocumentType',
				"service":'/BRMWrite.svc',
				"objects":[
					{
						"Arguments":{
							"ID_DocumentType":req.param('id')*1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.redirect('/admin/document_types');
					},
					function(result){
						req.flash('success','Tipul de document a fost sters cu succes!');
						return res.redirect('/admin/document_types');
					}
				);
			}
		);
	}
};
