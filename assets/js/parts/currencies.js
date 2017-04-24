/****** data functions ***************/

var currencies = [];

function getCurrencies(clear) {
	newSailsSocket.get('/home/currencies', {}, function(response) {
		if(response.Success) {
			if(clear) {
				currencies = [];
			}
			if(response.Result && response.Result.length>0) {
				for (var i=0;i<response.Result.length;i++) {
					processCurrency(response.Result[i]);
				}
			}
			$.event.trigger('currenciesLoaded',clear);
		}
		else {
			parseResponse('getCurrencies',response);
		}
	});
}

function processCurrency(item) {
	var idx = searchIdInArray(item.ID,currencies);
	if(idx == -1) {
		currencies.push(item);
	}
	else if(objectChanged(item,currencies[idx])) {
		currencies[idx] = item;
	}
	$.event.trigger({type:'currencyProcessed',ID_Currency:item.ID});
}

/******** logic ********/

$(document).on('socketConnected',function(e) {
	getCurrencies(true);
});
