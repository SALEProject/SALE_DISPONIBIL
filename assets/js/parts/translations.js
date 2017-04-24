function getTranslations() {
	newSailsSocket.get('/translation/all', {}, function(response) {
		if(response.Success) {
			if(response.Result && Object.keys(response.Result).length>0) {
				translations = response.Result;
				if(typeof MyDictionary != 'undefined') {
					MyDictionary.setData(translations);
				}
			}
		}
		else {
			parseResponse('getTranslations',response);
		}
	});
}

$(document).on('socketConnected',function(e) {
	newSailsSocket.on('translation', function(message) {
		getTranslations();
	});
});


