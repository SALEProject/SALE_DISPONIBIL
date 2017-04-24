exports.isEmpty = function(obj) {
    return !Object.keys(obj).length;
};
exports.getRingStatus = function(status) {
    switch(status) {
		case 'Closed':
			return 'inchisa';
			break;
		case 'Opened':
			return 'deschisa';
			break;
		case 'PreOpened':
			return 'in deschidere';
			break;
		case 'PreClosed':
			return 'in inchidere';
			break;
		case 'NONE':
			return 'inchisa';
			break;
	}
};
exports.getArrayItem = function(array,id,label) {
    for(var i=0;i<array.length;i++) {
		if(array[i].ID==id) {
			if(label) return array[i][label];
			else return array[i];
		}
	}
	return null;
};
exports.searchIdInArray = function(id,array) {
	var idx = -1;
    for(var i=0;i<array.length;i++) {
		if(array[i].ID==id) {
			idx = i;
			return i;
		}
	}
	return idx;
};
exports.searchItemInArray = function(id,array,label) {
	var idx = -1;
    for(var i=0;i<array.length;i++) {
		if(array[i][label]==id) {
			idx = i;
			return i;
		}
	}
	return idx;
};
exports.parseDate = function(dateText) {
	var d = new Date(dateText);
    return d.getDate()+'/'+d.getMonth()+'/'+d.getFullYear();
};
exports.getTime = function(dateText) {
	return dateText.substr(11,5);
	//var d = new Date(dateText);
    //return d.getHours()+':'+d.getMinutes();
};
exports.getCurrentTime = function() {
	var m = require('moment-timezone');
	return m.tz("Europe/Bucharest").format(); 
};
exports.getDateSince = function(seconds) {
	var moment = require('moment');
	return moment().subtract('seconds',seconds).format(); 
};
exports.parseResponse = function(response,error,success) {
	//console.log("result:"+ sails.util.inspect(response));
	if(response.Success || response.ErrorCode == 0) {
		//console.log('response.Success = true');
		if(response.ResultType=='LoginResult') {
			if(response.Result.Success) return success(response.Result);
			else return error(response.Result.Error);
		}
		else return success(response.Result);
	}
	else {
		//console.log('response.Success = false');
		if(response.ResultType=='String') return error(response.Result);
		else return error('Unknown error!'+sails.util.inspect(response));
	}
	return error('Unkown response format!');
};

exports.parse = function(error,result,cb_error,cb_success) {
	// Error handling
	  if (error) {
		console.log('BUUUUU:'+error);
		return next();

	  // The Book was found successfully!
	  } else {
		return toolsService.parseResponse(result,cb_error,cb_success);
	  }
};
exports.getFlashMessage = function(flash) {
	var html = '';
	var msg = '';
	var msg_class = '';
	if(Object.keys(flash).length>0) {
		if(flash.info) {
			msg_class = 'info';
			msg = flash.info;
		}
		if(flash.success) {
			msg_class = 'success';
			msg = flash.success;
		}
		if(flash.error) {
			msg_class = 'danger';
			msg = flash.error;
		}
		if(msg.length>0) {
			html = '<div class="alert alert-'+msg_class+'">'+
                '<button class="close" data-dismiss="alert"></button>';
			for(var i=0;i<msg.length;i++) {
				if (typeof msg[i] == 'object') {
					if(typeof msg[i].ResultType != 'undefined' && msg[i].ResultType == 'JSONKeyValuePairStruct') {
						for(var k in msg[i].Result) {
							if(msg[i]['Result'][k]!='') {
								html += '<p>'+k+': '+msg[i]['Result'][k]+'</p>';
							}
						}
					}
					else {
						for(var k in msg[i]) {
							if(msg[i][k]!='') {
								html += '<p>'+k+': '+msg[i][k]+'</p>';
							}
						}
					}
				}
				else {
					html += '<p>'+msg[i]+'</p>';
				}
			}
			html += '</div>';
		}
	}
	return html;
};

exports.getTranslation = function(label,req) {
	return toolsService.getLangTranslation(label,req.session.lang.code);
};

exports.getSysTranslation = function(label,req) {
	return toolsService.getSysLangTranslation(label,req.session.lang.code);
};

exports.getFieldTranslation = function(item,field,req) {
	return toolsService.getLangFieldTranslation(label,req.session.lang.code);
};

exports.getLangTranslation = function(label,lang) {
	if(lang=='RO') var lang_value = 'Value_RO';
	else var lang_value = 'Value_EN';
	if(typeof sails.storage.sysTranslations != 'undefined' && typeof sails.storage.sysTranslations[label] != 'undefined') {
		return sails.storage.sysTranslations[label][lang_value];
	}
	else if(typeof sails.storage.translations != 'undefined' && typeof sails.storage.translations[label] != 'undefined') {
		return sails.storage.translations[label][lang_value];
	}
	return label;
};

exports.getSysLangTranslation = function(label,lang) {
	if(lang=='RO') var lang_value = 'Value_RO';
	else var lang_value = 'Value_EN';
	if(typeof sails.storage.translations != 'undefined' && typeof sails.storage.translations[label] != 'undefined') {
		return sails.storage.translations[label][lang_value];
	}
	else if(typeof sails.storage.sysTranslations != 'undefined' && typeof sails.storage.sysTranslations[label] != 'undefined') {
		return sails.storage.sysTranslations[label][lang_value];
	}
	return label;
};

exports.hasTranslation = function(label) {
	if(typeof sails.storage.translations != 'undefined' && typeof sails.storage.translations[label] != 'undefined') {
		return true;
	}
	else {
		return false;
	}
};

exports.getLangFieldTranslation = function(item,field,lang) {
	if(lang=='RO') var lang_value = field+'_RO';
	else var lang_value = field+'_EN';
	if(typeof item[lang_value] != 'undefined') {
		return item[lang_value];
	}
	else if(typeof item[field] != 'undefined'){
		return item[field];
	}
	return null;
};

exports.updateTranslation = function(label,values) {
	sails.storage.translations[label] = {
		'Label':label,
		'Value_RO':values[label+'_RO'],
		'Value_EN':values[label+'_EN'],
	};
};

exports.sortArray = function(array,field) {
	var sort = [];
	for(var i=0;i<array.length;i++) {
		var k = false;
		for(var j=0;j<sort.length;j++) {
			if(array[i][field].toLowerCase() < sort[j][field].toLowerCase()) {
				sort.splice(j,0,array[i]);
				k = true;
				break;
			}
		}
		if(!k) {
			sort.push(array[i]);
		}
	}
	return sort;
};

exports.sortTranslatedArray = function(array,field,req) {
	var sort = [];
	if(typeof sails.storage.translations != 'undefined') {
		if(req.session.lang.code=='RO') var lang_value = 'Value_RO';
		else var lang_value = 'Value_EN';
		for(var i=0;i<array.length;i++) {
			var k = false;
			var label1 = array[i][field];
			var value1 = label1;
			if(typeof sails.storage.translations[label1] != 'undefined') {
				value1 = sails.storage.translations[label1][lang_value];
			}
			for(var j=0;j<sort.length;j++) {
				var label2 = sort[j][field];
				var value2 = label2;
				if(typeof sails.storage.translations[label2] != 'undefined') {
					value2 = sails.storage.translations[label2][lang_value];
				}
				if(value1.toLowerCase() < value2.toLowerCase()) {
					sort.splice(j,0,array[i]);
					k = true;
					break;
				}
			}
			if(!k) {
				sort.push(array[i]);
			}
		}
		return sort;
	}
	else {
		return array;
	}
};

exports.parseValidation = function(result,req) {
if(result.Rows.length > 0) {
	for(var i in result.Rows) {
		//req.flash('error',result.Rows[i]);
		req.flash('error',result.Rows[i].Pas+': '+result.Rows[i].Mesaj);
	}
}
else {
	req.flash('info','Validare OK');
}
};