/****** data functions ***************/

var assets = [];

function getAssets(clear) {
	var start = Date.now();
	console.log('requesting assets..');
	newSailsSocket.get('/asset', {ID_Ring:-1}, function(response) {
		if(response.Success) {
			if(clear) {
				assets = [];
			}
			if(response.Result && response.Result.length>0) {
				for (var i=0;i<response.Result.length;i++) {
					processAsset(response.Result[i]);
				}
			}
			console.log('get assets: '+ (Date.now()-start));
			$.event.trigger('assetsLoaded',clear);
		}
		else {
			parseResponse('getAssets',response);
		}
	});
}

function getAsset(id) {
	var start = Date.now();
	newSailsSocket.get('/asset', {ID_Ring:-1,ID_Asset:id}, function(response) {
		if(response.Success) {
			if(response.Result && response.Result.length>0) {
				for (var i=0;i<response.Result.length;i++) {
					processAsset(response.Result[i]);
				}
			}
			console.log('get asset ('+response.Result[i].ID+'): '+ (Date.now()-start));
			$.event.trigger('assetsLoaded',clear);
		}
		else {
			parseResponse('getAsset',response);
		}
	});
}

function processAsset(item) {
	var idx = searchIdInArray(item.ID,assets);
	if(idx == -1) {
		assets.push(item);
		//$.event.trigger({type:'assetUpdated',ID_Asset:item.ID});
	}
	else if(objectChanged(item,assets[idx])) {
		assets[idx] = item;
	}
	$.event.trigger({type:'assetUpdated',ID_Asset:item.ID});
}


/****** view functions ***************/

function updateAsset(id) {
	var $item = $("#asset-"+id);
	var item = getArrayItem(assets,id);
	if(item) {
		var $list = $("#ring-"+item.ID_Ring+" .ring-assets");
		if(item.isDeleted) {
			$item.remove();
			$.event.trigger({type:'assetDeleted',ID_Asset:item.ID});
		}
		else if(item.isActive==false) {
			$item.remove();
			$.event.trigger({type:'assetDisabled',ID_Asset:item.ID});
		}
		else {
			if($item.length>0) {
				$item.find('.asset-name').html('[' + item.Code + '] ' + getTranslation(item.Name));
			}
			else {
				var html = $("#ring-list").data('prototype-asset');
				if(typeof html == 'undefined') {
					log('asset list has no prototype');
				}
				else {
					html = getPrototypeData(item,html);
					$list.append(html);
				}
			}
			$.event.trigger({type:'assetShown',ID_Asset:item.ID});
		}
	}
	else {
		log('asset #'+id+' not found');
	}
}

function updateAssetStatus(id) {
	var $item = $("#asset-"+id);
	var item = getArrayItem(assets,id);
	if(item) {
		$item.find('.asset-name').attr('title',assetStatusString(item.Status));
		$item.find('.asset-status').removeClass('opened').removeClass('opening').removeClass('closing').removeClass('closed').addClass(assetStatusLabel(item.Status));
	}
	else {
		log('asset #'+id+' not found');
	}
}

function assetStatusString(status) {
	if(status=='Opened') return getTranslation('Transacting_session');
	else if(status=='PreOpened') return getTranslation('Openning_session');
	else if(status=='None') return getTranslation('No_session');
	else if(status=='PreClosed') return getTranslation('Closing_session');
	else if(status=='Closed') return getTranslation('Closed_session');
	return '';
}

function assetStatusLabel(status) {
	if(status=='Opened') return 'opened';
	else if(status=='PreOpened') return 'opening';
	else if(status=='PreClosed') return 'closing';
	else if(status=='Closed') return 'closed';
	else if(status=='None') return '';
	return '';
}


/******** logic *************/

$(document).on('assetUpdated',function(e) {
	updateAsset(e.ID_Asset);
});

$(document).on('assetShown',function(e) {
	updateAssetStatus(e.ID_Asset);
});

$(document).on('activeRingsShown',function(e,clear) {
	getAssets(clear);
});

$(document).on('socketConnected',function(e) {
	if($("#context-container").length>0) {
		$(document).on('click',".asset-name",function(e){
			e.preventDefault();
			var $this = $(this).closest('.asset-item');
			var ring_id = $this.data('ring-id');
			$(".ring-item").removeClass('selected');
			$(".asset-item").removeClass('selected');
			$this.addClass('selected');
			$("#ring-"+ring_id).addClass('selected');
			if(typeof changeContext == "function") {
				changeContext(ring_id,$this.data('id'));
			}
		});

		newSailsSocket.on('asset', function(message) {
			if(typeof getAllRings == 'function') {
				getAllRings();
			}
		});
	}
});


