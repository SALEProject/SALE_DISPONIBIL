/****** data functions ***************/

var rings = [];
var activeRings = [];

function getAllRings(clear) {
	console.log('requesting rings..');
	if( io && newSailsSocket)
	newSailsSocket.get('/ring', {all:true}, function(response) {
		if(response.Success) {
			if(clear) {
				rings = [];
			}
			if(response.Result && response.Result.length>0) {
				for (var i=0;i<response.Result.length;i++) {
					processRing(response.Result[i]);
				}
			}
			$.event.trigger('ringsLoaded',clear);
		}
		else {
			parseResponse('getRings',response);
		}
	});
}

function processRing(item) {
	var idx = searchIdInArray(item.ID,rings);
	if(idx == -1) {
		rings.push(item);
	}
	else if(objectChanged(item,rings[idx])) {
		rings[idx] = item;
	}
	$.event.trigger({type:'ringProcessed',ID_Ring:item.ID});
}

function getActiveRings(clear) {
	newSailsSocket.get('/ring', {}, function(response) {
		if(response.Success) {
			if(clear) {
				activeRings = [];
			}
			if(response.Result && response.Result.length>0) {
				for (var i=0;i<response.Result.length;i++) {
					processActiveRing(response.Result[i]);
				}
			}
			$.event.trigger('activeRingsLoaded',clear);
		}
		else {
			parseResponse('getActiveRings',response);
		}
	});
}

function processActiveRing(item) {
	var idx = searchIdInArray(item.ID,activeRings);
	if(idx == -1) {
		activeRings.push(item);
	}
	else if(objectChanged(item,activeRings[idx])) {
		activeRings[idx] = item;
	}
	$.event.trigger({type:'activeRingProcessed',ID_Ring:item.ID});
}


/****** view functions ***************/

function updateActiveRings(clear) {
	var $container = $("#context-container");
	if($container.length>0) {
		if(clear) {
			$("#ring-list").html('');
		}
		$container.find(".loader").show();
		for (var i=0;i<activeRings.length;i++) {
			updateActiveRing(rings[i].ID);
		}
		$container.find(".loader").hide();
		$.event.trigger('activeRingsShown',clear);
	}
}

function updateActiveRing(id) {
	var $list = $("#ring-list");
	var $item = $("#ring-"+id);
	var item = getArrayItem(activeRings,id);
	if(item) {
		if(item.isDeleted) {
			$item.remove();
			$.event.trigger({type:'activeRingDeleted',ID_Ring:item.ID});
		}
		else if(item.isActive==false) {
			$item.remove();
			$.event.trigger({type:'activeRingDisabled',ID_Ring:item.ID});
		}
		else {
			if($item.length>0) {
				$item.find('.ring-name').html(getTranslation(item.Name));
			}
			else {
				var html = $list.data('prototype');
				if(typeof html == 'undefined') {
					log('ring list has no prototype');
				}
				else {
					html = getPrototypeData(item,html);
					$list.append(html);
				}
			}
			$.event.trigger({type:'activeRingUpdated',ID_Ring:item.ID});
		}
	}
	else {
		log('ring #'+id+' not found');
	}
}


/******* events **********/

$(document).on('assetTypesLoaded',function(e) {
	getAllRings(true);
});
$(document).on('wakeUp',function(e) {
	getAllRings();
});


$(document).on('activeRingUpdated',function(e) {
});

$(document).on('ringsLoaded',function(e,clear) {
	getActiveRings(clear);
});

$(document).on('activeRingsLoaded',function(e,clear) {
	updateActiveRings(clear);
});

$(document).on('socketConnected',function(e) {
	if($("#context-container").length>0) {
		$(document).on('click',".expand-toggle",function(e){
			e.preventDefault();
			$parent = $(this).closest('li');
			if($parent.hasClass('collapsed')) $parent.removeClass('collapsed');
			else $parent.addClass('collapsed');
		});
		
		$(document).on('click',".ring-name",function(e){
			e.preventDefault();
			var $this = $(this).closest('.ring-item');
			$(".ring-item").removeClass('selected');
			$(".asset-item").removeClass('selected');
			$this.addClass('selected');
			if(typeof changeContext == "function") {
				changeContext($this.data('id'),null);
			}
			if($this.hasClass('collapsed')) $this.removeClass('collapsed');
		});
		
		newSailsSocket.on('ring', function(message) {
			getAllRings();
		});
	}
});

