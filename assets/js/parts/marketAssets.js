/****** data functions ***************/

var marketAssets = [];
var marketFilters = {
	ring: -1,
	assetType: -1
};

function getMarketAssets(clear) {
	newSailsSocket.get('/market/assets', {ID_Ring:marketFilters.ring, ID_AssetType:marketFilters.assetType}, function(response) {
		if(response.Success) {
			if(clear) {
				marketAssets = [];
			}
			if(response.Result && response.Result.length>0) {
				for (var i=0;i<response.Result.length;i++) {
					processMarketAsset(response.Result[i]);
				}
			}
			$.event.trigger('marketAssetsLoaded',clear);
		}
		else {
			parseResponse('getMarketAssets',response);
		}
	});
}

function processMarketAsset(item) {
	var idx = searchItemInArray(item.ID_Asset,marketAssets,'ID_Asset');
	if(idx == -1) {
		marketAssets.push(item);
	}
	else if(objectChanged(item,marketAssets[idx])) {
		marketAssets[idx] = item;
	}
	$.event.trigger({type:'marketAssetUpdated',ID_Asset:item.ID_Asset});
}


/****** view functions ***************/

function updateMarketAssets(clear) {
	var $container = $("#market-assets-container");
	if($container.length>0) {
		if(clear) {
			$("#market-assets-list tbody").html('');
		}
		$container.find(".loader").show();
		for (var i=0;i<marketAssets.length;i++) {
			updateMarketAsset(marketAssets[i].ID_Asset);
		}
		$container.find(".loader").hide();
		$.event.trigger('marketAssetsShown',clear);
	}
}

function updateMarketAsset(id) {
	var $item = $("#market-asset-"+id);
	var item = marketAssets[searchItemInArray(id,marketAssets,'ID_Asset')];
	if(item) {
		var $list = $("#market-assets-list");
		if(item.isDeleted) {
			$item.remove();
			$.event.trigger({type:'marketAssetDeleted',ID_Asset:item.ID_Asset});
		}
		else if(item.isActive==false) {
			$item.remove();
			$.event.trigger({type:'marketAssetDisabled',ID_Asset:item.ID_Asset});
		}
		var html = $list.data('prototype');
		if(typeof html == 'undefined') {
			log('market assets list has no prototype');
		}
		else {
			html = getPrototypeData(item,html);
			html = html.replace('__ASSET_STATUS__',assetStatusLabel(item.AssetStatus));
			html = html.replace('__PREOPENINGTIME__',item.PreOpeningTime);
			html = html.replace('__CLOSINGTIME__',item.ClosingTime);
			/*
			if(typeof item.StartDate != 'undefined') {
				var startdate = moment(item.StartDate);
				html = html.replace('__STARTDATE__',startdate.format('DD MMM HH:mm'));
			}
			else {
				html = html.replace('__STARTDATE__','');
			}
			if(typeof item.EndDate != 'undefined') {
				var enddate = moment(item.EndDate);
				html = html.replace('__ENDDATE__',enddate.format('DD MMM HH:mm'));
			}
			else {
				html = html.replace('__ENDDATE__','');
			}
			*/
			if($item.length>0) {
				$item.replaceWith(html);
			}
			else {
				$list.find('tbody').append(html);
			}
			$.event.trigger({type:'marketAssetShown',ID_Asset:item.ID_Asset});
		}
	}
	else {
		log('market asset #'+id+' not found');
	}
}

/******** logic *************/

$(document).on('marketAssetUpdated',function(e) {
	//updateMarketAsset(e.ID_Asset);
});

$(document).on('marketAssetShown',function(e) {
});

$(document).on('marketAssetsLoaded',function(e,clear) {
	updateMarketAssets(clear);
});

$(document).on('ringsLoaded',function(e,clear) {
	getMarketAssets(clear);
});

$(document).on('socketConnected',function(e) {
	if($("#market-assets-container").length>0) {
		$(document).on('change',".market-asset-filter",function(e){
			e.preventDefault();
			var $this = $(this);
			var filter = $this.attr('data-filter');
			var value = $this.val()!='' ? $this.val() : null;
			marketFilters[filter] = value;
			getMarketAssets(true);
		});
		$(document).on('click',".market-ring-context",function(e){
			e.preventDefault();
			var ring_id = $(this).attr('data-id');
			$(".ring-context").val(ring);
			if(typeof changeContext == "function") {
				changeContext(ring_id,null);
			}
		});
		$(document).on('click',".market-asset-context",function(e){
			e.preventDefault();
			if(!$(this).hasClass('selected')) {
				var ring_id = $(this).attr('data-ring-id');
				var asset_id = $(this).attr('data-id');
				$(".market-asset-context").removeClass('selected');
				$(this).addClass('selected');
				$(".ring-item").removeClass('selected');
				$("#ring-"+ring_id).addClass('selected').removeClass('collapsed');
				$(".asset-item").removeClass('selected');
				$("#asset-"+asset_id).addClass('selected');
				if(typeof changeContext == "function") {
					changeContext(ring_id,asset_id);
				}
			}
		});
	}
});


