/****** data functions ***************/

var assetTypes = [];

function getAssetTypes(clear) {
	newSailsSocket.get('/assettype', {ID_Ring:-1}, function(response) {
		if(response.Success) {
			if(clear) {
				assetTypes = [];
			}
			if(response.Result && response.Result.length>0) {
				for (var i=0;i<response.Result.length;i++) {
					processAssetType(response.Result[i]);
				}
			}
			$.event.trigger('assetTypesLoaded',clear);
		}
		else {
			parseResponse('getAssetTypes',response);
		}
	});
}

function processAssetType(item) {
	var idx = searchIdInArray(item.ID,assetTypes);
	if(idx == -1) {
		assetTypes.push(item);
	}
	else if(objectChanged(item,assetTypes[idx])) {
		assetTypes[idx] = item;
	}
	$.event.trigger({type:'assetTypeProcessed',ID_AssetType:item.ID});
}

/******** logic ********/


$(document).on('socketConnected',function(e) {
	getAssetTypes();
});
