module.exports = {

	documents: function (req, res) {
		var title = 'Documente - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/documents/documents';
		restService.select(
			'Document',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getDocuments',
				"objects": [
					{
						"Arguments": {
							"all": true
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
  
  
	document_add: function (req, res) {
		var title = 'Adaugare document - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/documents/document_add';
		var asset = null;
		if(req.param('asset')) {
			var asset = req.session.asset;
			if(!asset) {
				req.flash('error','Activul nu a fost gasit!');;
			}
		}
		if(req.method == 'POST') {
			//console.log(req.files);
			var fileUrl = '';
			req.file('Document').upload({
				maxBytes: 10000000
				},function whenDone(err, uploadedFiles) {
					if (err) {
						req.flash('error',err);
						return res.view(view,{layout:layout, title:title, item:req.body, asset:asset});
					}
					if (uploadedFiles.length === 0){
						req.flash('error','No file was uploaded');
						return res.view(view,{layout:layout, title:title, item:req.body, asset:asset});
					}
					console.log(uploadedFiles[0]);
					var newFilename = uploadedFiles[0].fd.replace(sails.config.appPath+'/.tmp/uploads/','');
					fileUrl = '/uploads/'+newFilename;
					//console.log(req.body);
		restService.select(
			'Document',
						{
							"SessionId":sessionService.getSessionID(req),
							"currentState":'login',
							"method":'execute',
							"procedure":'addDocument',
							"service":'/BRMWrite.svc',
							"objects":[
								{
									"Arguments":{					
										"ID_Asset":req.param('ID_Asset')*1,
										"ID_DocumentType":req.param('ID_DocumentType')*1,
										"Name":req.param('Name'),					
										"FileName":uploadedFiles[0].filename,					
										"isPublic":(req.param('isPublic')=='1'?true:false),										
										"ID_CreatedByUser":req.session.currentUser.ID,								
										"DocumentURL": fileUrl
									}
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
									req.flash('success','Documentul a fost adaugat cu succes!');
									if(req.param('asset')) {
										return res.redirect('/admin/documents/asset_documents?asset='+req.param('asset'));
									}
									else {
										return res.redirect('/admin/documents');
									}
								}
							);
						}
					);
				}
			);
		}
		else return res.view(view,{layout:layout, title:title, item:{}, asset:asset});
	},

	document_edit: function (req, res) {
		var title = 'Modificare document - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/documents/document_add';
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		var asset = null;
		if(req.param('asset')) {
			var asset = req.session.asset;
			if(!asset) {
				req.flash('error','Activul nu a fost gasit!');;
			}
		}
		if(req.method == 'POST') {
			var fileUrl = '';
			req.file('Document').upload({
				maxBytes: 10000000
				},function whenDone(err, uploadedFiles) {
					if (err) {
						req.flash('error',err);
						return res.view(view,{layout:layout, title:title, item:req.body, asset:asset});
					}
					if (uploadedFiles.length === 0){
		restService.select(
			'Document',
							{
								"SessionId":sessionService.getSessionID(req),
								"currentState":'login',
								"method":'execute',
								"procedure":'editDocument',
								"service":'/BRMWrite.svc',
								"objects":[
									{
										"Arguments":{
											"ID_Document":req.param('id')*1,
											"ID_Asset":req.param('ID_Asset')*1,
											"ID_DocumentType":req.param('ID_DocumentType')*1,
											"Name":req.param('Name'),					
											"isPublic":(req.param('isPublic')=='1'?true:false),										
											"ID_CreatedByUser":req.session.currentUser.ID
										}
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
										req.flash('success','Documentul a fost modificat cu succes!');
										if(req.param('asset')) {
											return res.redirect('/admin/documents/asset_documents?asset='+req.param('asset'));
										}
										else {
											return res.redirect('/admin/documents');
										}
									}
								);
							}
						);
					}
					else {
						var newFilename = uploadedFiles[0].fd.replace(sails.config.appPath+'/.tmp/uploads/','');
						fileUrl = '/uploads/'+newFilename;
		restService.select(
			'Document',
							{
								"SessionId":sessionService.getSessionID(req),
								"currentState":'login',
								"method":'execute',
								"procedure":'editDocument',
								"service":'/BRMWrite.svc',
								"objects":[
									{
										"Arguments":{
											"ID_Document":req.param('id')*1,
											"ID_Asset":req.param('ID_Asset')*1,
											"ID_DocumentType":req.param('ID_DocumentType')*1,
											"Name":req.param('Name'),					
											"FileName":uploadedFiles[0].filename,					
											"isPublic":(req.param('isPublic')=='1'?true:false),										
											"ID_CreatedByUser":req.session.currentUser.ID,								
											"DocumentURL":fileUrl
										}
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
										req.flash('success','Documentul a fost modificat cu succes!');
										if(req.param('asset')) {
											return res.redirect('/admin/documents/asset_documents?asset='+req.param('asset'));
										}
										else {
											return res.redirect('/admin/documents');
										}
									}
								);
							}
						);
					}
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
					"procedure":'getDocuments',
					"objects":[{
						"Arguments":{
							ID_Document:req.param('id')*1,
							"all": true
						}
					}]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view(view,{layout:layout, title:title, item:{}, asset:asset});
						},
						function(result){
							var document;
							_.each(result.Rows,function(item){
								if(item.ID==req.param('id')) document = item; 
							});
							if(!document) return res.send(500,'Document not found!');
							return res.view(view,{layout:layout, title:title, item:document, asset:asset});
						}
					);
				}
			);
		}
	},

	download: function (req, res) {
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		restService.select(
			'Document',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getDocuments',
				"objects":[{
					"Arguments":{
						ID_Document:req.param('id')*1,
						"all": true
					}
				}]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.redirect('/admin/documents');
					},
					function(result){
						var document;
						console.log(result.Rows);
						_.each(result.Rows,function(item){
							if(item.ID==req.param('id')) document = item; 
						});
						if(!document) return res.send(500,'Document not found!');
						if(document.DocumentURL) {
							if(!document.isPublic && (!req.session.authenticated || typeof req.session.currentUser == 'undefined' || typeof req.session.currentUser.isAdministrator == 'undefined' || !req.session.currentUser.isAdministrator)) {
								return res.send(500,'You ar not allowed to download this file!');
							}
							var fs = require('fs');
							if (fs.existsSync(sails.config.appPath+'/.tmp'+document.DocumentURL)) {
								res.sendfile(sails.config.appPath+'/.tmp'+document.DocumentURL);
							}
							else {
								console.log(sails.config.appPath+'/.tmp'+document.DocumentURL);
								return res.send(500,'File not found!');
							}
						}
						else {
							console.log(document.DocumentURL);
							return res.send(500,'File not found!');
						}
					}
				);
			}
		);
	},

	asset_documents: function (req, res) {
		var title = 'Documente - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/documents/asset_documents';
		var asset = null;
		if(req.param('asset')) {
			var asset = req.session.asset;
			if(!asset) {
				req.flash('error','Activul nu a fost gasit!');;
			}
		}
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
								toolsService.parseValidation(result,req);
								return res.view(view,{layout:layout, title:title, asset:asset, initialOrder:{}});
							}
						);
					}
				);
			}
			else {
				req.flash('success','Datele au fost salvate cu succes!');
				return res.redirect('/admin/assets/edit/'+asset.ID);
			}
		}
		else {
		restService.select(
			'Ring',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getRingClients',
					"objects":[{
						"Arguments":{
							"ID_Market":sails.marketId,
							"ID_Ring":asset.ID_Ring
						}
					}]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view(view,{layout:layout, title:title});
						},
						function(result){
							req.session.ringClients = result.Rows;
							return res.view(view,{layout:layout, title:title, asset:asset, initialOrder:{}});
						}
					);
				}
			);
		}
	},

	document_delete: function (req, res) {
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');

		restService.select(
			'Document',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"procedure":'deleteDocument',
				"service":'/BRMWrite.svc',
				"objects":[
					{
						"Arguments":{
							"ID_Document":req.param('id')*1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						if(req.param('asset')) {
							return res.redirect('/admin/documents/asset_documents?asset='+req.param('asset'));
						}
						else {
							return res.redirect('/admin/documents');
						}
					},
					function(result){
						req.flash('success','Documentul a fost sters cu succes!');
						if(req.param('asset')) {
							return res.redirect('/admin/documents/asset_documents?asset='+req.param('asset'));
						}
						else {
							return res.redirect('/admin/documents');
						}
					}
				);
			}
		);
	}
};
