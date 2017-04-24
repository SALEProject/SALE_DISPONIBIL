/****** data functions ***************/

var measuringUnits = [];

function getMeasuringUnits(clear) {
	newSailsSocket.get('/home/measuringunits', {}, function(response) {
		if(response.Success) {
			if(clear) {
				measuringUnits = [];
			}
			if(response.Result && response.Result.length>0) {
				for (var i=0;i<response.Result.length;i++) {
					processMeasuringUnit(response.Result[i]);
				}
			}
			$.event.trigger('measuringUnitsLoaded',clear);
		}
		else {
			parseResponse('getMeasuringUnits',response);
		}
	});
}

function processMeasuringUnit(item) {
	var idx = searchIdInArray(item.ID,measuringUnits);
	if(idx == -1) {
		measuringUnits.push(item);
	}
	else if(objectChanged(item,measuringUnits[idx])) {
		measuringUnits[idx] = item;
	}
	$.event.trigger({type:'measuringUnitProcessed',ID_MeasuringUnit:item.ID});
}

/******** logic ********/

$(document).on('socketConnected',function(e) {
	getMeasuringUnits(true);
});
