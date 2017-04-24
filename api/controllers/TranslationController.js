module.exports = {

	translations: function (req, res) {
		var title = 'Traduceri - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/translations/translations';
		var items = [];
		for(var i in sails.storage.sysTranslations) {
			items.push(sails.storage.sysTranslations[i]);
		}
		return res.view(view,{layout:layout, title:title, items:items});
	},
  
  
	translation_add: function (req, res) {
		var title = 'Adaugare traducere - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/translations/translation_add';
		if(req.method == 'POST') {
		restService.select(
			'Nomenclator',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'addTranslation',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"Label":req.param('Label'),
								"Value_RO":req.param('Value_RO'),
								"Value_EN":req.param('Value_EN'),
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
							eventService.getSysTranslations(function() {
								req.flash('success','Traducerea a fost adaugata cu succes!');
								return res.redirect('/admin/translations');
							});
						}
					);
				}
			);
		}
		else return res.view(view,{layout:layout, title:title, item:{}});
	},

	translation_edit: function (req, res) {
		var title = 'Modificare traducere - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var view = 'admin/translations/translation_add';
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		if(req.method == 'POST') {
		restService.select(
			'Nomenclator',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'editTranslation',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Translation":req.param('id')*1,
								"Label":req.param('Label'),
								"Value_RO":req.param('Value_RO'),
								"Value_EN":req.param('Value_EN')
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
							eventService.getSysTranslations(function() {
								req.flash('success','Traducerea a fost modificata cu succes!');
								return res.redirect('/admin/translations');
							});
						}
					);
				}
			);
		}
		else {
		restService.select(
			'Nomenclator',
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getTranslations',
					"objects":[{
						"Arguments":{
							"ID_Translation":req.param('id')*1
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
							var translation;
							_.each(result.Rows,function(item){
								if(item.ID==req.param('id')) translation = item; 
							});
							if(!translation) return res.send(500,'Translation not found!');
							return res.view(view,{layout:layout, title:title, item:translation});
						}
					);
				}
			);
		}
	},

	translation_delete: function (req, res) {
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		restService.select(
			'Nomenclator',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"procedure":'deleteTranslation',
				"service":'/BRMWrite.svc',
				"objects":[
					{
						"Arguments":{
							"ID_Translation":req.param('id')*1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.redirect('/admin/translations');
					},
					function(result){
						eventService.getSysTranslations(function() {
							req.flash('success','Traducerea a fost stersa cu succes!');
							return res.redirect('/admin/translations');
						});
					}
				);
			}
		);
	},
	
	all: function (req, res) {
		var items = {};
		if(req.session.lang.code=='RO') var lang_value = 'Value_RO';
		else var lang_value = 'Value_EN';
		for(var i in sails.storage.sysTranslations) {
			items.push({key:sails.storage.sysTranslations[i].Label, value: sails.storage.sysTranslations[i][lang_value].replace(/\r?\n/g, '<br />')});
		}
		return res.json({Success:true, ResultType:'Object', Result: items});
	},

	js: function (req, res) {
		var items = {};
		if(req.session.lang.code=='RO') var lang_value = 'Value_RO';
		else var lang_value = 'Value_EN';
		for(var i in sails.storage.sysTranslations) {
			items[sails.storage.sysTranslations[i].Label] = sails.storage.sysTranslations[i][lang_value];
		}
		return res.view({layout:null, items:items});
	}
};
