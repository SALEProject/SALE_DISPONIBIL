/****** data functions ***************/

var context = {
	ring_id: null,
	asset_id: null,
	ring: null,
	asset: null,
	assetSession: null,
	assetOrders: {},
	orderMatches: [],
	brokerClients: [],
	userCanBuy: false,
	userCanSell: false,
	initialOrder: null,
	ordonator: false,
	activeOrder: null,
	ownOrders: {},
	mainClient: null,
	allowedDirection: null,
	loaded: {
		orderMatches: false,
		orders: false,
		session: false,
		brokerClients: false
	},
	deltaTStarted: false,
	DeltaTRemaining: null,
	deltaTTimer: null,
	deltaT1Started: false,
	DeltaT1Remaining: null,
	deltaT1Timer: null
};
var processing_asset_session = false;
var processing_asset_orders = false;
var processing_order_matches = false;
var processing_broker_clients = false;
var sessionRestrictions = {
	'PriceStepping':getTranslation('Price_Stepping_short'),
	'QuantityStepping':getTranslation('Quantity_Stepping_short'),
	'MinQuantity':getTranslation('Min_Quantity_short'),
	'MinPrice':getTranslation('Min_Price_short'),
	'MaxPrice':getTranslation('Max_Price_short'),
	'MaxPriceVariation':getTranslation('Max_Price_Variation_short')
};

function getAssetSession() {
	if(context.ring_id && context.asset_id && !processing_asset_session) {
		var start_time = Date.now();
		processing_asset_session = setTimeout(function() {
			context.loaded.session = false;
			newSailsSocket.get('/asset/assetsession', {ID_Ring:context.ring_id,ID_Asset:context.asset_id}, function(response) {
				if(response.Success) {
					if(response.Result && response.Result.length>0) {
						context.assetSession = response.Result[0];
						context.DeltaTRemaining = context.assetSession.DeltaTRemaining;
						context.DeltaT1Remaining = context.assetSession.DeltaT1Remaining;
					}
					else {
						context.assetSession = getArrayItem(rings,context.ring_id);
					}
					console.log('get asset session: '+(Date.now()-start_time));
					if(context.assetSession.ID_InitialOrder!=0) {
						//context.initialOrder = getArrayItem(context.assetOrders,context.assetSession.ID_InitialOrder);
						context.initialOrder = context.assetOrders[context.assetSession.ID_InitialOrder];
						if(!context.initialOrder) {
							newSailsSocket.get('/order/details', {id:context.assetSession.ID_InitialOrder}, function(response) {
								if(response.Success) {
									if(response.Result && response.Result.length>0) {
										context.mainClient = response.Result[0].ID_Client;
										context.initialOrder = response.Result[0];
										if(response.Result[0].ID_Agency==a_id) {
											context.ordonator = true;
											//console.log('order details:');
											//console.log(response.Result[0]);
											context.allowedDirection = response.Result[0].Direction;
											//updateAssetSession();
										}
									}
									context.loaded.session = true;
									processing_asset_session = false;
									$.event.trigger('assetSessionLoaded');
									console.log('get asset session initial order: '+(Date.now()-start_time));
								}
							});
						}
						//else if(context.initialOrder && (context.initialOrder.ID_Broker == b_id || searchItemInArray(context.initialOrder.ID_Client,context.brokerClients,'ID_Client')>-1 || context.initialOrder.ID_Agency==a_id)) context.ordonator = true;
						else if(context.initialOrder.ID_Broker==b_id || context.initialOrder.ID_Agency==a_id) {
							context.allowedDirection = context.initialOrder.Direction;
							context.loaded.session = true;
							context.ordonator = true;
							processing_asset_session = false;
							$.event.trigger('assetSessionLoaded');
							console.log('get asset session initial order: '+(Date.now()-start_time));
						}
						else {
							context.allowedDirection = context.initialOrder.Direction;
							processing_asset_session = false;
							context.loaded.session = true;
							$.event.trigger('assetSessionLoaded');
							console.log('get asset session initial order: '+(Date.now()-start_time));
						}
					}
					else {
						processing_asset_session = false;
						context.loaded.session = true;
						$.event.trigger('assetSessionLoaded');
						console.log('get asset session initial order: '+(Date.now()-start_time));
					}
				}
				else {
					parseResponse('getAssetSession',response);
				}
			});
		},100);
	}
}

function getAssetOrderMatches() {
	if(context.ring && context.asset && !processing_order_matches) {
		var start_time = Date.now();
		processing_order_matches = setTimeout(function() {
			context.loaded.orderMatches = false;
			newSailsSocket.get('/order/matches', {ID_Asset:context.asset_id}, function(response) {
				if(response.Success) {
					context.orderMatches = response.Result;
					processing_order_matches = false;
					context.loaded.orderMatches = true;
					$.event.trigger('assetOrderMatchesLoaded');
					console.log('get order matches: '+(Date.now()-start_time));
				}
				else {
					parseResponse('getAssetOrderMatches',response);
				}
			});
		},100);
	}
}

function getAssetOrders() {
	if(context.ring && context.asset && !processing_asset_orders) {
		var start_time = Date.now();
		processing_asset_orders = setTimeout(function() {
			context.loaded.orders = false;
			context.assetOrders = {};
			newSailsSocket.get('/order', {ID_Ring:context.ring_id,ID_Asset:context.asset_id}, function(response) {
				if(response.Success) {
					if(response.Result.length>0) {
						for(var i=0;i<response.Result.length;i++) {
							processAssetOrder(response.Result[i]);
						}
					}
					processing_asset_orders = false;
					context.loaded.orders = true;
					$.event.trigger('assetOrdersLoaded');
					console.log('get asset orders: '+(Date.now()-start_time));
				}
				else {
					parseResponse('getAssetOrders',response);
				}
			});
		},100);
	}
}

function processAssetOrder(item,callback) {
	//var idx = searchIdInArray(item.ID,context.assetOrders);
	//console.log(item);
	if(context.initialOrder && item.ID == context.initialOrder.ID) {
		context.initialOrder = item;
	}
	if(item.ID_Broker == b_id || (item.ID_Agency == a_id && item.isInitial)) {
		if(item.isActive || item.isSuspended || item.isTransacted) {
			context.ownOrders[item.ID] = item;
		}
		else {
			delete context.ownOrders[item.ID];
		}
	}
	if((item.ID_Broker == b_id || item.ID_Agency == a_id) && (item.isTransacted || item.isSuspended) && $("#order-ID").val() == item.ID) {
		console.log('closing edit form');
		closeEditForm();
	}
	if(item.isCanceled || !(item.isActive || item.isSuspended || item.isTransacted || item.isCanceled)) {
		delete context.assetOrders[item.ID];
		if($("#order-ID").val() == item.ID) {
			closeEditForm();
		}
		$.event.trigger({type:'assetOrderProcessed',ID_Order:item.ID});
		if(callback) callback(item.ID,true);
		return;
	}

	if(typeof context.assetOrders[item.ID] == 'undefined') {
		context.assetOrders[item.ID] = item;
		$.event.trigger({type:'assetOrderProcessed',ID_Order:item.ID});
		if(item.ID_Broker == b_id) context.activeOrder = item;
		if(callback) callback(item.ID,true);
		if(context.assetSession && item.ID == context.assetSession.ID_InitialOrder) {
			context.initialOrder = item;
			updateAssetSession();
		}
		if(context.assetSession && item.isActive && item.isInitial && item.ID != context.assetSession.ID_InitialOrder) {
			console.log("MISSING asset session info");
			console.log(item);
			getAssetSession();
		}
	}
	else if(objectChanged(item,context.assetOrders[item.ID])) {
		if(!context.assetOrders[item.ID].isTransacted) {
		  context.assetOrders[item.ID] = item;
		}
		if(context.assetSession && item.ID == context.assetSession.ID_InitialOrder) {
			context.initialOrder = item;
			updateAssetSession();
		}
		if(context.initialOrder !== null && context.assetSession && item.ID == context.initialOrder.ID && !item.isActive) {
			context.initialOrder = null;
			updateAssetSession();
		}
		if(context.assetSession && item.isActive && item.isInitial) {
			console.log("MISSING asset session info");
			//getAssetSession();
		}
		$.event.trigger({type:'assetOrderProcessed',ID_Order:item.ID});
		if(callback) callback(item.ID,true);
	}
	else {
		// update item anyway
		context.assetOrders[item.ID] = item;
		//console.log('object not changed');
	}
}

function getBrokerClients() {
	if(context.ring && context.asset && !processing_broker_clients) {
		var start_time = Date.now();
		processing_broker_clients = setTimeout(function() {
			context.loaded.brokerClients = false;
			newSailsSocket.get('/home/clients', {ID_Ring:context.ring_id,ID_Asset:context.asset_id}, function(response) {
				if(response.Success) {
					context.userCanBuy = false;
					context.userCanSell = false;
					//if(response.Result.length>0) {
						context.brokerClients = response.Result;
						for(var i=0;i<response.Result.length;i++) {
							if(response.Result[i].canBuy) context.userCanBuy = true;
							if(response.Result[i].canSell) context.userCanSell = true;
						}
					//}
					processing_broker_clients = false;
					context.loaded.brokerClients = true;
					$.event.trigger('brokerClientsLoaded');
					console.log('get broker clients: '+(Date.now()-start_time));
				}
				else {
					log('get broker clients: '+response.Result);
				}
			});
		},100);
	}
}

function resetAssetSessionContext() {
	context.assetSession = null;
	context.ordonator = false;
	context.mainClient = null;
	context.initialOrder = null;
	context.activeOrder = null;
	context.userCanBuy = false;
	context.userCanSell = false;
	context.assetOrders = {};
	context.orderMatches = [];
	context.brokerClients = [];
	context.ownOrders = {};
	context.loaded = {
		orderMatches: false,
		orders: false,
		session: false,
		brokerClients: false
	}
}

function sessionDataLoaded() {
	if(context.asset && context.ring && context.assetSession && context.loaded.orderMatches && context.loaded.orders && context.loaded.session && context.loaded.brokerClients) {
		$.event.trigger('sessionLoaded');
		return true;
	}
	return false;
}


/****** view functions ***************/

function changeContext(ring_id, asset_id) {
	if(ring_id) {
		if(ring_id!=context.ring_id) {
			context.ring = getArrayItem(rings,ring_id);
			context.ring_id = ring_id;
			context.assetSession = null;
			context.asset = null;
			context.asset_id = null;
			//assetOrders = [];
			//changeRingAssets();
			$("#order-ID_Ring").val(ring_id);
			$("#add-inital-order").show();
			$("#session-ring").html('&gt; '+getTranslation(context.ring.Name)).show();
		}
	}
	else {
		$("#asset-orders-container").hide();
		$("#add-inital-order").hide();
		context.assetSession = null;
		context.asset = null;
		context.asset_id = null;
		//assetOrders = [];
		//changeRingAssets();
		$("#session-ring").html('').hide();
	}
	if(asset_id) {
		//if(asset!=context.asset) {
			context.asset = getArrayItem(assets,asset_id);
			context.asset_id = asset_id;
			//assetOrders = [];
			// show assets
			//getAssetOrders(true);
			$("#session-asset").html('&gt; '+getTranslation(context.asset.Name)).show();
		//}
	}
	else {
		//assetOrders = [];
		$("#asset-orders-container").hide();
		$("#session-asset").html('').hide();
	}
	resetOrderForm();
	$("#order-form-container").hide();
	$.event.trigger('contextChanged');
}

function resetOrderForm() {
	if(document.getElementById('order-form')) {
	document.getElementById('order-form').reset();
	var $form = $("#order-form");
	$form.find(".error").remove();
	$("#order-ID").val('');
	if(context.ring && context.asset && context.assetSession) {
		var um = getArrayItem(measuringUnits,context.asset.ID_MeasuringUnit);
		var cu = getArrayItem(currencies,context.asset.ID_Currency);
		if(context.assetSession.QuantityStepping!=null) {
			var q_mask = (context.assetSession.QuantityStepping+'').replace(/([0-9])/g,'#');
			$("#quantity-stepping-placeholder").html(um.Code+' ('+q_mask+' / '+context.assetSession.QuantityStepping+')');
			$("#order-Quantity").data('m-dec',getSteppingDecimal(context.assetSession.QuantityStepping));
			$("#order-Quantity").autoNumeric('update',{mDec:getSteppingDecimal(context.assetSession.QuantityStepping)});
			if(currentLang == 'EN') {
				$("#order-Quantity").data('a-sep',',');
				$("#order-Quantity").data('a-dec','.');
				$("#order-Quantity").autoNumeric('update',{aDec:'.', aSep:','});
			}
		}
		else {
			$("#quantity-stepping-placeholder").html(um.Code);
		}
		if(context.assetSession.PriceStepping!=null) {
			var p_mask = (context.assetSession.PriceStepping+'').replace(/([0-9])/g,'#');
			$("#price-stepping-placeholder").html(cu.Code+' / '+um.Code+' ('+p_mask+' / '+context.assetSession.PriceStepping+')');
			$("#order-Price").data('m-dec',getSteppingDecimal(context.assetSession.PriceStepping));
			$("#order-Price").autoNumeric('update',{mDec:getSteppingDecimal(context.assetSession.PriceStepping)});
			if(currentLang == 'EN') {
				$("#order-Price").data('a-sep',',');
				$("#order-Price").data('a-dec','.');
				$("#order-Price").autoNumeric('update',{aDec:'.', aSep:','});
			}
		}
		else {
			$("#price-stepping-placeholder").html(cu.Code+' / '+um.Code);
		}
		$("#order-ID_Client").html('').attr('disabled',false);
		$("#order-ID_Client").attr('readonly',false);
		$("#partial").prop('disabled',false);
		$("#total").prop('disabled',false);
		if(context.initialOrder && context.initialOrder.DifferentialPriceAllowed) {
			$("#DifferentialPriceLabel").html(typeof context.assetSession.DifferentialPriceText != 'undefined' && context.assetSession.DifferentialPriceText ? '('+context.assetSession.DifferentialPriceText+')' : '');
		}
		else {
			$("#DifferentialPriceLabel").html('');
		}
	}
	}
}

function resetAssetSession() {
	if(context.ring_id && context.asset_id) {
		$("#asset-name").html('');
		$("#asset-description").html('');
		$("#delta-t").html('');
		if(context.asset.ID_InitialOrder) {
			$("#delta-t").closest('h4').show();
		}
		else {
			$("#delta-t").closest('h4').hide();
		}
		$("#delta-t1").html('');
		$("#asset-schedule .t1").html('');
		$("#asset-schedule .t2").html('');
		$("#asset-schedule .t3").html('');
		$("#asset-schedule .t4").html('');
		$("#asset-schedule .t1").attr('style','');
		$("#asset-schedule .t2").attr('style','');
		$("#asset-schedule .t3").attr('style','');
		$("#asset-schedule .i1").attr('style','');
		$("#asset-schedule .i2").attr('style','');
		$("#asset-schedule .i3").attr('style','');
		$("#asset-schedule .progress-bar").css('width','0%');
		$("#session-restrictions").html('');
		/*
		$("#SessionPriceStepping").html('');
		$("#SessionQuantityStepping").html('');
		$("#SessionMinQuantity").html('');
		$("#SessionMinPrice").html('');
		$("#SessionMaxPrice").html('');
		*/
	}
}

function updateAssetSession() {
	if(context.ring_id && context.asset_id && context.assetSession) {
		var $container = $("#asset-orders-container");
		$("#asset-name").html(getTranslation(context.asset.Name));
		$("#asset-description").html(getTranslation(context.asset.Description));
		/*
		if(Object.keys(context.ownOrders).length>0) {
			$("#delta-t").html(getRemainingTime(context.assetSession.DeltaTRemaining));
			$("#delta-t1").html(getRemainingTime(context.assetSession.DeltaT1Remaining));
		}
		else {
			$("#delta-t").html(context.assetSession.DeltaT+':00');
			$("#delta-t1").html(context.assetSession.DeltaT1+':00');
		}
		*/
		var restrictions = [];
		/*
		for(var i in sessionRestrictions) {
			if(context.assetSession[i]!=0) {
				restrictions.push('<span>'+sessionRestrictions[i]+': <strong>'+context.assetSession[i]+'</strong></span>');
			}
		}
		*/

		var um = getArrayItem(measuringUnits,context.asset.ID_MeasuringUnit);
		var cu = getArrayItem(currencies,context.asset.ID_Currency);
		var q_mask_complete = '';
		var qDec = 2;
		var pDec = 2;
		if(context.assetSession.QuantityStepping!=null) {
			var q_mask = (context.assetSession.QuantityStepping+'').replace(/([0-9])/g,'#');
			q_mask_complete += um.Code+' ('+q_mask+' / '+context.assetSession.QuantityStepping+')';
			qDec = getSteppingDecimal(context.assetSession.QuantityStepping);
		}
		var p_mask_complete = '';
		if(context.assetSession.PriceStepping!=null) {
			var p_mask = (context.assetSession.PriceStepping+'').replace(/([0-9])/g,'#');
			p_mask_complete = cu.Code+' / '+um.Code+' ('+p_mask+' / '+context.assetSession.PriceStepping+')';
			pDec = getSteppingDecimal(context.assetSession.PriceStepping);
		}

		var html = '<div class="row">';
		html += '<div class="col-md-6">';
			if(context.initialOrder) {
				html += '<span>'+getTranslation('Transacted_quantity_short')+': <strong>'+localeNumber(context.initialOrder.Quantity,qDec)+'</strong> ' + um.Code + '</span>';
				html += '<br/>';
			}
			html += '<span>' + sessionRestrictions['MinQuantity'] + ': <strong>' + (context.assetSession['MinQuantity']!= null ? context.assetSession['MinQuantity'] : '-') + '</strong> ' + q_mask_complete + '</span>';
			html += '<br/>';
			html += '<span>' + getTranslation('Price') + ': <strong>' + (context.initialOrder && context.initialOrder.DifferentialPriceAllowed && context.assetSession.DifferentialPriceText ? context.assetSession.DifferentialPriceText : '-') + '</strong> ' + p_mask_complete + (context.assetSession['MinPrice'] || context.assetSession['MaxPrice'] ? ' [' + (context.assetSession['MinPrice'] ? context.assetSession['MinPrice'] : '') + ' - ' + (context.assetSession['MaxPrice'] ? context.assetSession['MaxPrice'] : '') + ']' : '') + '</span>';
			if(context.assetSession.MaxPriceVariation) {
				html += '<br/>';
				html += '<span>' + getTranslation('Max_Price_Variation_short') + ': <strong>&#177; ' + context.assetSession.MaxPriceVariation + '%</strong></span>';
			}
		html += '</div>';
		if(context.assetSession.TransactionsCount>0) {
			html += '<div class="col-md-6">';
				html += '<div class="row">';
					html += '<div class="col-md-12">';
						html += '<span>'+getTranslation('Transactions_count_short')+': <strong>'+context.assetSession.TransactionsCount+'</strong></span>';
					html += '</div>';
				html += '</div>';
				html += '<div class="row">';
					html += '<div class="col-md-12">';
						html += '<span>'+getTranslation('Total_volume_short')+': <strong>'+localeNumber(context.assetSession.TotalVolume,qDec)+'</strong> ' + um.Code + '</span>';
					html += '</div>';
				html += '</div>';
				html += '<div class="row">';
					html += '<div class="col-md-6">';
						html += '<span>'+getTranslation('Total_value_short')+': <strong>'+localeNumber(context.assetSession.TotalValue,pDec)+'</strong> ' + cu.Code + '</span>';
					html += '</div>';
				html += '</div>';
				html += '<div class="row">';
					html += '<div class="col-md-6">';
						var quot = context.assetSession.TotalValue/context.assetSession.TotalVolume;
						//html += '<span>'+getTranslation('Quotation')+': <strong>'+ (quot != 0 ? localeNumber(quot,pDec) : '0') +'</strong> ' + cu.Code + '</span>';
						html += '<span>'+getTranslation('Quotation')+': <strong>'+ (typeof context.assetSession.Quotation != 'undefined' ?  localeNumber(context.assetSession.Quotation,pDec) : (quot != 0 ? localeNumber(quot,pDec) : '0')) +'</strong> ' + cu.Code + '</span>';
					html += '</div>';
				html += '</div>';
				html += '<div class="row">';
					html += '<div class="col-md-6">';
						html += '<span>'+getTranslation('Last_price')+': <strong>'+localeNumber(context.assetSession.ClosingPrice,pDec)+'</strong> ' + cu.Code + '</span>';
					html += '</div>';
				html += '</div>';
			html += '</div>';
		}
		else {
			html += '<div class="col-md-6">';
				html += '<div class="row">';
					html += '<div class="col-md-12">';
						html += '<span>'+getTranslation('Transactions_count_short')+': <strong>'+context.assetSession.TransactionsCount+'</strong></span>';
					html += '</div>';
				html += '</div>';
				html += '<div class="row">';
					html += '<div class="col-md-6">';
						html += '<span>'+getTranslation('Quotation')+': <strong>'+ (typeof context.assetSession.Quotation != 'undefined' ?  localeNumber(context.assetSession.Quotation,pDec) : (context.assetSession.SpotQuotation ? localeNumber(context.assetSession.SpotQuotation,pDec) : '')) +'</strong> ' + cu.Code + '</span>';
					html += '</div>';
				html += '</div>';
			html += '</div>';
		}
		html += '</div>';
		$("#session-restrictions").html(html);

		/*
		if(context.assetSession['PriceStepping']!=0) {
			restrictions.push('<span>'+sessionRestrictions['PriceStepping']+': <strong>'+context.assetSession['PriceStepping']+'</strong></span>');
		}
		if(context.assetSession['QuantityStepping']!=0) {
			restrictions.push('<span>'+sessionRestrictions['QuantityStepping']+': <strong>'+context.assetSession['QuantityStepping']+'</strong></span>');
		}
		if(context.assetSession['MinQuantity']!=0) {
			restrictions.push('<span>'+sessionRestrictions['MinQuantity']+': <strong>'+context.assetSession['MinQuantity']+'</strong> ' + measuringUnits[searchIdInArray(context.asset.ID_MeasuringUnit,measuringUnits)].Code + '</span>');
		}
		if(context.assetSession['MinPrice']!=0) {
			restrictions.push('<span>'+sessionRestrictions['MinPrice']+': <strong>'+context.assetSession['MinPrice']+'</strong> ' + currencies[searchIdInArray(context.asset.ID_Currency,currencies)].Code + '</span>');
		}
		if(context.assetSession['MaxPrice']!=0) {
			restrictions.push('<span>'+sessionRestrictions['MaxPrice']+': <strong>'+context.assetSession['MaxPrice']+'</strong> ' + currencies[searchIdInArray(context.asset.ID_Currency,currencies)].Code + '</span>');
		}
		if(context.assetSession['MaxPriceVariation']!=0) {
			restrictions.push('<span>'+sessionRestrictions['MaxPriceVariation']+': <strong>'+context.assetSession['MaxPriceVariation']+'</strong> %</span>');
		}
		if(context.initialOrder && context.initialOrder.DifferentialPriceAllowed && context.assetSession.DifferentialPriceText) {
			restrictions.push('<span>'+getTranslation('DifferentialPrice_short')+': <strong>'+ context.assetSession.DifferentialPriceText +'</strong> ' + currencies[searchIdInArray(context.asset.ID_Currency,currencies)].Code + '</span>');
		}

		var qDec = 2;
		if(context.asset.ID_InitialOrder && context.asset.initalOrder) {
			qDec = getSteppingDecimal(context.assetSession.QuantityStepping);
			restrictions.push('<span class="">'+getTranslation('Transacted_quantity')+': <strong>'+localeNumber(context.initialOrder.Quantity,qDec)+'</strong> ' + measuringUnits[searchIdInArray(context.asset.ID_MeasuringUnit,measuringUnits)].Code + '</span>');
		}
		var pDec = 2;
		if(context.asset.ID_InitialOrder && context.asset.initalOrder) {
			pDec = getSteppingDecimal(context.assetSession.PriceStepping);
		}
		if(context.assetSession.TransactionsCount>0) {
			restrictions.push('<span class="">'+getTranslation('Total_volume_short')+': <strong>'+localeNumber(context.assetSession.TotalVolume,qDec)+'</strong> ' + measuringUnits[searchIdInArray(context.asset.ID_MeasuringUnit,measuringUnits)].Code + '</span>');
			restrictions.push('<span class="">'+getTranslation('Total_value_short')+': <strong>'+localeNumber(context.assetSession.TotalValue,pDec)+'</strong> ' + currencies[searchIdInArray(context.asset.ID_Currency,currencies)].Code + '</span>');
			restrictions.push('<span class="">'+getTranslation('Transactions_count_short')+': <strong>'+context.assetSession.TransactionsCount+'</strong></span>');
			restrictions.push('<span class="">'+getTranslation('Quotation')+': <strong>'+ localeNumber(context.assetSession.TotalValue/context.assetSession.TotalVolume,pDec) + '</strong> ' + currencies[searchIdInArray(context.asset.ID_Currency,currencies)].Code + '</span>');
		}
		$("#session-restrictions").html(restrictions.join(', '));
		*/

		/*
		$("#SessionPriceStepping").html(context.assetSession.PriceStepping);
		$("#SessionQuantityStepping").html(context.assetSession.QuantityStepping);
		$("#SessionMinQuantity").html(context.assetSession.MinQuantity);
		$("#SessionMinPrice").html(context.assetSession.MinPrice);
		$("#SessionMaxPrice").html(context.assetSession.MaxPrice);
		*/

		$("#add-bid-button,#add-ask-button").hide();
		switch(context.assetSession.Status) {
			case 'PreOpened':
				if(context.asset.ID_InitialOrder) {
					if(context.ordonator) {
						if(((!context.initialOrder || (context.initialOrder && !context.initialOrder.isActive)) && context.allowedDirection=='B')) {
							$("#add-bid-button").show();
						}
						if(((!context.initialOrder || (context.initialOrder && !context.initialOrder.isActive)) && context.allowedDirection=='S')) {
							$("#add-ask-button").show();
						}
					}
					else {
						if(context.initialOrder && context.initialOrder.Direction=='B' && context.userCanSell) {
							$("#add-ask-button").show();
						}
						if(context.initialOrder && context.initialOrder.Direction=='S' && context.userCanBuy) {
							$("#add-bid-button").show();
						}
					}
				}
				else {
					if(context.userCanSell) {
						$("#add-ask-button").show();
					}
					if(context.userCanBuy) {
						$("#add-bid-button").show();
					}
				}
				break;
			case 'Opened':
					if(context.ordonator) {
						if((!context.initialOrder || (context.initialOrder &&! context.initialOrder.isActive)) && context.allowedDirection=='B') {
							$("#add-bid-button").show();
						}
						if((!context.initialOrder || (context.initialOrder &&! context.initialOrder.isActive)) && context.allowedDirection=='S') {
							$("#add-ask-button").show();
						}
					}
					else if(context.assetSession.PreOpeningTime == context.assetSession.OpeningTime) {
            for (var item in context.assetOrders) {
              var order = context.assetOrders[item];

              if (order.Direction == 'B' && order.isActive && context.userCanSell) {
                $("#add-ask-button").show();
              }

              if (order.Direction == 'S' && order.isActive && context.userCanBuy) {
                $("#add-bid-button").show();
              }
            }
					} else if (context.asset.AuctionType == 'double') {
            $("#add-ask-button").show();
            $("#add-bid-button").show();
          }
				break;
			case 'PreClosed':
				if(context.asset.ID_InitialOrder) {
					if(context.ordonator) {
						if((!context.initialOrder || (context.initialOrder &&! context.initialOrder.isActive)) && context.allowedDirection=='B') {
							$("#add-bid-button").show();
						}
						if((!context.initialOrder || (context.initialOrder &&! context.initialOrder.isActive)) && context.allowedDirection=='S') {
							$("#add-ask-button").show();
						}
					}
				}
				//if(context.assetSession.DeltaTStarted) startDeltaT(asset_schedule.DeltaTRemaining);
				//if(context.assetSession.DeltaT1Started) startDeltaT1(asset_schedule.DeltaT1Remaining);
				break;
		}
		$container.show();
		if($("#main-menu-toggle-wrapper").is(":visible")) {
			$('html, body').animate({
			  scrollTop: $("#asset-details-container").offset().top - 10
			}, 400);
		}
		$.event.trigger('assetSessionFinished');
	}
}

function setScheduleIntervals() {
	if(context.ring_id && context.asset_id && context.assetSession) {
		$("#asset-schedule .t1").html('T0 (' + trimScheduleTime(context.assetSession.PreOpeningTime) + ')');
		$("#asset-schedule .t2").html('T1 (' + trimScheduleTime(context.assetSession.OpeningTime) + ')');
		$("#asset-schedule .t3").html('T2 (' + trimScheduleTime(context.assetSession.PreClosingTime) + ')');
		$("#asset-schedule .t4").html('T3 (' + trimScheduleTime(context.assetSession.ClosingTime) + ')');
		var start = parseScheduleTime(context.assetSession.PreOpeningTime);
		var d1 = parseScheduleTime(context.assetSession.OpeningTime);
		var d2 = parseScheduleTime(context.assetSession.PreClosingTime);
		var end = parseScheduleTime(context.assetSession.ClosingTime);
		if(d1!=start){
			$(".progress-interval").css('width','33.33%');
      $("#asset-schedule .t1").show();
      $("#asset-schedule .i1").show();
      $("#asset-schedule .t2").css('left','33.33%');
      $("#asset-schedule .i2").css('left','33.33%');
      $("#asset-schedule .t3").css('left','66.66%');
		}
		else {
			$("#asset-schedule .t1").hide();
			$("#asset-schedule .i1").hide();
			$(".progress-interval").css('width','50%');
			$("#asset-schedule .t2").css('left','0');
			$("#asset-schedule .i2").css('left','0');
			$("#asset-schedule .t3").css('left','50%');
		}
		/*
		if(d1!=start){
			$("#asset-schedule .i1").css('width',(d1-start)*100/(end-start)+'%');
		}
		else {
			$("#asset-schedule .t1").hide();
			$("#asset-schedule .i1").hide();
		}
		$("#asset-schedule .t2").css('left',(d1-start)*100/(end-start)+'%');
		$("#asset-schedule .i2").css('left',(d1-start)*100/(end-start)+'%');
		$("#asset-schedule .t3").css('left',(d2-start)*100/(end-start)+'%');
		var width = ((d2-start)*100/(end-start) - (d1-start)*100/(end-start));
		if(width<38) {
			$("#asset-schedule .t3").css('top','20px');
		}
		else {
			$("#asset-schedule .t3").css('top','-20px');
		}
		$("#asset-schedule .i2").css('width',width +'%');
		$("#asset-schedule .i3").css('width',(100-(d2-start)*100/(end-start)) +'%');
		*/
	}
}

function parseScheduleTime(text) {
	var time = 0;
  var parts = text.split(':');
  if (parts.length != 3) return null;
  time = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
	return time;
}

function trimScheduleTime(time) {
	return time.substr(0,time.length-3);
}

function getRemainingTime(secs) {
	return Math.floor(secs/60)+':'+((secs%60)<10 ? '0'+(secs%60) : (secs%60));
}

function updateAssetOrderMatches() {
	if(context.ring_id && context.asset_id && context.assetSession) {
		console.log('remove matches');
		$("#buy-orders-list .match").removeClass('match');
		$("#sell-orders-list .match").removeClass('match');
		for(var i=0;i<context.orderMatches.length;i++) {
			$("#asset-order-"+context.orderMatches[i].ID_Order).addClass('match');
			$("#asset-order-"+context.orderMatches[i].ID_MatchedOrder).addClass('match');
		}
		updateDeltas();
	}
}

function updateAssetOrders() {
	if(context.ring_id && context.asset_id && context.assetSession) {
		$buy_list = $("#buy-orders-list");
		$sell_list = $("#sell-orders-list");
		$("#buy-orders .loader").show();
		$("#sell-orders .loader").show();
		$buy_list.find('tbody').html('');
		$sell_list.find('tbody').html('');
		/*
		for(var i=0;i<context.assetOrders.length;i++) {
			updateAssetOrder(context.assetOrders[i].ID,false);
		}
		*/
		for(var i in context.assetOrders) {
			updateAssetOrder(context.assetOrders[i].ID,false);
		}
		$("#buy-orders .loader").hide();
		$("#sell-orders .loader").hide();
		if($buy_list.find('tbody tr').length==0) {
			$("#buy-orders .empty-message").show();
		}
		if($sell_list.find('tbody tr').length==0) {
			$("#sell-orders .empty-message").show();
		}
	}
}

function updateAssetOrder(id,animate) {
	if(context.ring_id && context.asset_id && context.assetSession) {
		var $item = $("#asset-order-"+id);
		var item = typeof context.assetOrders[id] != 'undefined' ? context.assetOrders[id] : null;
		if(item) {
		//log('updating asset #'+item.ID);
			var $list = item.Direction=='B' ? $("#buy-orders-list") : $("#sell-orders-list");
			if(item.isSuspended) {
				$item.addClass('suspended');
			}
			//if(item.isCanceled || item.isTransacted || (!item.isActive && !item.isSuspended)) {
			if(item.isCanceled || item.isTransacted || (!item.isActive && !item.isTransacted && !item.isSuspended)) {
				if(animate) $("#asset-order-"+item.ID).effect('highlight',700);
				$item.remove();
				$.event.trigger({type:'assetOrderDeleted',ID_Order:item.ID});
			}
			else {
				var html = $list.data('prototype');
				if(typeof html == 'undefined') {
					log('asset orders list has no prototype');
				}
				else {
					html = getPrototypeData(item,html);
					if($item.length>0) {
						$item.replaceWith(html);
					}
					else {
						$list.find('tbody').append(html);
					}
					if(animate) $("#asset-order-"+item.ID).effect('highlight',700);
					$.event.trigger({type:'assetOrderShown',ID_Order:item.ID});
				}
			}
		}
		else {
			var $item = $("#asset-order-"+id);
			$item.remove();
			$.event.trigger({type:'assetOrderDeleted',ID_Order:id});
			//log('asset order #'+id+' not found');
		}
	}
}

function updateAssetOrderData(id) {
	if(context.ring_id && context.asset_id && context.assetSession) {
		var $item = $("#asset-order-"+id);
		var item = typeof context.assetOrders[id] != 'undefined' ? context.assetOrders[id] : null;
		if(item && item.isTransacted && !(item.isActive || item.isTransacted || item.isSuspended)) {
			$("#asset-order-"+id).remove();
			return;
		}
		if(item) {
			var d3 = new moment(item.ExpirationDate);
			var d4 = new moment(item.Date);
			var match = false;
			//var ownOrder = (item.ID_Broker==b_id || (item.ID_Agency==a_id && item.isInitial)) ? true : false;
			var ownOrder = (item.ID_Broker==b_id ||  item.ID_Agency==a_id) ? true : false;
			for(var i=0;i<context.orderMatches.length;i++) {
				if(context.orderMatches[i].ID_Order==item.ID || context.orderMatches[i].ID_MatchedOrder==item.ID) match = true;
			}
			if(item.isSuspended) {
				$item.addClass('suspended');
			}
			if(ownOrder) {
				$item.addClass('self');
			}
			if(match) {
				$item.addClass('match');
			}
			var qDec = getSteppingDecimal(context.assetSession.QuantityStepping);
			var pDec = getSteppingDecimal(context.assetSession.PriceStepping);
			$item.find(".asset-order-quantity").html(localeNumber(item.Quantity,qDec));
			if(item.Price!==null) {
				$item.find(".asset-order-price").html(localeNumber(item.Price,pDec));
			}
			$item.find(".asset-order-timestamp").html(d4.format('x'));
			$item.find(".asset-order-client").html(item.Client);
			$item.find(".asset-order-partial").html((item.PartialFlag?'P':'T'));
			$item.find(".asset-order-expiration-date").html(d3.format('DD MMM HH:mm'));
			if(context.ordonator && !ownOrder) {
				if((context.assetSession.Status=='PreOpened' || context.assetSession.Status=='Opened'  || context.assetSession.Status=='PreClosed') && (item.Direction=='B' && context.userCanSell) || (item.Direction=='S' && context.userCanBuy)) {
          $item.find('.add-matching-order').show();
				}
			}
			else if(!ownOrder) {
				if(context.asset.ID_InitialOrder) {
					if((context.assetSession.Status=='PreOpened' || (context.assetSession.Status=='Opened' && context.activeOrder) || (context.assetSession.Status=='Opened' && context.assetSession.PreOpeningTime == context.assetSession.OpeningTime)) && ((item.Direction=='S' && context.userCanBuy) || (item.Direction=='B' && context.userCanSell))) {
						$item.find('.add-matching-order').show();
					}
				}
				else {
					if((context.assetSession.Status=='PreOpened' || context.assetSession.Status=='Opened') && ((item.Direction=='S' && context.userCanBuy) || (item.Direction=='B' && context.userCanSell))) {
						$item.find('.add-matching-order').show();
					}
				}
			}
			if(ownOrder && (context.assetSession.Status=='PreOpened' || context.assetSession.Status=='Opened' || (context.assetSession.Status=='PreClosed' && context.ordonator))) {
				console.log('assetsession delta t remaining: '+context.assetSession.DeltaTRemaining);
				console.log('context delta t remaining: '+context.DeltaTRemaining);
				if(context.assetSession.DeltaTRemaining > 0 || context.asset.AuctionType == 'double')  {
					console.log('delta t remaining > 0');
					$item.find('.edit-order-button').show();
				}
				$item.find('.cancel-order-button').show();
			}
			$("#sell-orders-list").trigger("updateAll", true, function(){});
			$("#buy-orders-list").trigger("updateAll", true, function(){});
		}
		else {
			log('asset order #'+id+' not found');
		}
	}
}

function updateSessionStatus() {
	if(context.ring && context.asset && context.assetSession) {
		if(context.assetSession.Status=='PreOpened') {
			$("#session-status").html(getTranslation('Openning_session'));
			$("#session-details").show();
		}
		else if(context.assetSession.Status=='Opened') {
			$("#session-status").html(getTranslation('Transactions'));
			$("#session-details").show();
		}
		else if(context.assetSession.Status=='PreClosed') {
			$("#session-status").html(getTranslation('Closing_session'));
			$("#session-details").show();
		}
		else if(context.assetSession.Status=='Closed') {
			$("#session-status").html(getTranslation('Closed_session'));
			$("#session-details").show();
		}
		else {
			$("#session-status").html(getTranslation('Future_session'));
			$("#session-details").show();
		}
		$("#session-details .session-price").show();
	}
	else {
		$("#session-status").html('');
		$("#session-details").hide();
		$("#session-details .session-price").hide();
	}
}

function updateAssetSessionDeltas() {
	if(context.ring && context.asset && context.assetSession) {
		if(context.DeltaTRemaining !== null) $("#delta-t").html(getRemainingTime(context.DeltaTRemaining));
		if(context.DeltaT1Remaining !== null) $("#delta-t1").html(getRemainingTime(context.DeltaT1Remaining));
	}
}

function updateAssetSessionTime() {
	if(context.ring && context.asset && context.assetSession) {
		var start = parseScheduleTime(context.assetSession.PreOpeningTime);
		var d1 = parseScheduleTime(context.assetSession.OpeningTime);
		var d2 = parseScheduleTime(context.assetSession.PreClosingTime);
		var end = parseScheduleTime(context.assetSession.ClosingTime);
		var now = time.diff([time.format('YYYY'),time.format('M')-1,time.format('D')],'seconds');
		var segmentWidth = start == d1 ? 50 : 33.33;
		$("#asset-schedule .progress-bar").removeClass('session-opening').removeClass('session-opened').removeClass('session-closing').removeClass('session-closed');
		if(context.assetSession.Status=='Closed') {
			$("#asset-schedule .progress-bar").css('width','100%');
			$("#asset-schedule .progress-bar").addClass('session-closed');
		}
		else if(context.assetSession.Status=='Opened') {
			if(now>=d1 && now<=d2) {
				var diff = d2-d1;
				var dt = (now-d1)*segmentWidth/diff;
				$("#asset-schedule .progress-bar").css('width',(segmentWidth==50 ? dt : dt+segmentWidth)+'%');
				$("#asset-schedule .progress-bar").addClass('session-opened');
			}
		}
		else if(context.assetSession.Status=='PreOpened') {
			if(now>=start && now<=d1) {
				var diff = d1-start;
				var dt = (now-start)*segmentWidth/diff;

				$("#asset-schedule .progress-bar").css('width',dt+'%');
				$("#asset-schedule .progress-bar").addClass('session-opening');
			}
		}
		else if(context.assetSession.Status=='PreClosed') {
			if(now>=d2 && now<=end) {
				var diff = end-d2;
				var dt = (now-d2)*segmentWidth/diff;
				$("#asset-schedule .progress-bar").css('width',(dt+(segmentWidth==50 ? 1 : 2)*segmentWidth)+'%');
				$("#asset-schedule .progress-bar").addClass('session-closing');
			}
		}
		else if(context.assetSession.Status=='Closed') {
			$("#asset-schedule .progress-bar").css('width','100%');
			//$("#asset-schedule .progress-bar").addClass('session-closed');
			//$("#session-status").html(getTranslation('closed'));
		}
		else {
			$("#asset-schedule .progress-bar").css('width','0%');
			//$("#session-status").html(getTranslation('closed'));
		}
		$("#session-details .session-price").show();
		/*
		if(!context.assetSession.DeltaTStarted && !context.deltaTStarted) {
			$("#delta-t").html(getRemainingTime(context.assetSession.DeltaTRemaining));
		}
		if(!context.assetSession.DeltaT1Started && !context.deltaT1Started) {
			$("#delta-t1").html(getRemainingTime(context.assetSession.DeltaT1Remaining));
		}
		*/
	}
}

function updateDeltas() {
	if(context.ring && context.asset && context.assetSession) {
		if(!context.deltaTStarted) {
			context.DeltaTRemaining = context.assetSession.DeltaTRemaining;
			//$("#delta-t").html(getRemainingTime(context.assetSession.DeltaTRemaining));
		}
		if(!context.deltaT1Started || context.orderMatches.length==0) {
			context.DeltaT1Remaining = context.assetSession.DeltaT1Remaining;
			//$("#delta-t1").html(getRemainingTime(context.assetSession.DeltaT1Remaining));
			$("#delta-t1").removeClass('dt1-started');
		}
	}
}


function updateAssetLists() {
	if(context.ring && context.asset && context.assetSession) {
		$buy_list = $("#buy-orders-list");
		$sell_list = $("#sell-orders-list");
		if($buy_list.find('tbody tr').length>0) {
			$buy_list.parent().find(".empty-message").hide();
		}
		else {
			$buy_list.parent().find(".empty-message").show();
		}
		if($sell_list.find('tbody tr').length>0) {
			$sell_list.parent().find(".empty-message").hide();
		}
		else {
			$sell_list.parent().find(".empty-message").show();
		}
	}
}

function onContextChanged () {
  newSailsSocket.get('/context/change', {ID_Asset:context.asset_id, ID_Ring: context.ring_id}, function(response) {
    // process order matches
    {
      context.orderMatches = response.Result.orderMatches;
      context.loaded.orderMatches = true;
      $.event.trigger('assetOrderMatchesLoaded');
    }

    // process broker clients
    {
      context.userCanBuy = false;
      context.userCanSell = false;
      context.brokerClients = response.Result.brokerClients;
      for (var i = 0; i < response.Result.brokerClients.length; i++) {
        if (response.Result.brokerClients[i].canBuy) context.userCanBuy = true;
        if (response.Result.brokerClients[i].canSell) context.userCanSell = true;
      }
      context.loaded.brokerClients = true;
      $.event.trigger('brokerClientsLoaded');
    }

    // process asset session
    {
      if (response.Result.assetSession && response.Result.assetSession.length > 0) {
        context.assetSession = response.Result.assetSession[0];
        context.DeltaTRemaining = context.assetSession.DeltaTRemaining;
        context.DeltaT1Remaining = context.assetSession.DeltaT1Remaining;
      }
      else {
        context.assetSession = getArrayItem(rings, context.ring_id);
      }

      if (context.assetSession.ID_InitialOrder != 0) {
        context.initialOrder = context.assetOrders[context.assetSession.ID_InitialOrder];
        if (!context.initialOrder) {
          newSailsSocket.get('/order/details', {id: context.assetSession.ID_InitialOrder}, function (response) {
            if (response.Success) {
              if (response.Result && response.Result.length > 0) {
                context.mainClient = response.Result[0].ID_Client;
                context.initialOrder = response.Result[0];
                if (response.Result[0].ID_Agency == a_id) {
                  context.ordonator = true;
                  context.allowedDirection = response.Result[0].Direction;
                }
              }
              context.loaded.session = true;
              $.event.trigger('assetSessionLoaded');
            }
          });
        }
        else if (context.initialOrder.ID_Broker == b_id || context.initialOrder.ID_Agency == a_id) {
          context.allowedDirection = context.initialOrder.Direction;
          context.loaded.session = true;
          context.ordonator = true;
          processing_asset_session = false;
          $.event.trigger('assetSessionLoaded');
        }
        else {
          context.allowedDirection = context.initialOrder.Direction;
          processing_asset_session = false;
          context.loaded.session = true;
          $.event.trigger('assetSessionLoaded');
        }
      }
      else {
        processing_asset_session = false;
        context.loaded.session = true;
        $.event.trigger('assetSessionLoaded');
      }
    }

    // process asset orders
    {
      if (response.Result.assetOrders.length > 0) {
        for (var i = 0; i < response.Result.assetOrders.length; i++) {
          processAssetOrder(response.Result.assetOrders[i]);
        }
      }
      context.loaded.orders = true;
      $.event.trigger('assetOrdersLoaded');
    }
  });
}



/******** logic *************/

var process_start_time = 0;
$(document).on('contextChanged',function(e) {
	process_start_time = Date.now();
	resetAssetSessionContext();
	resetOrderForm();
	resetAssetSession();
  if (context.ring_id && context.asset_id) {
    onContextChanged();
  }
  //getAssetOrderMatches();
  //getBrokerClients();
  //getAssetOrders();
  //getAssetSession();
});


$(document).on('assetSessionLoaded',function(e) {
	//console.log('assetSessionLoaded');
	//updateAssetSession();
	//setScheduleIntervals();
	//updateAssetOrders();
	sessionDataLoaded();
});

$(document).on('brokerClientsLoaded',function(e) {
	//console.log('brokerClientsLoaded');
	sessionDataLoaded();
});
$(document).on('assetOrdersLoaded',function(e) {
	//console.log('assetOrdersLoaded');
	//getAssetSession();
	sessionDataLoaded();
});

$(document).on('assetOrderShown',function(e) {
	//console.log('assetOrderShown');
	updateAssetOrderData(e.ID_Order);
	updateAssetLists();
	updateAssetOrderMatches();
	updateDeltas();
});

$(document).on('assetSessionFinished',function(e) {
	//console.log('assetSessionFinished');
	updateSessionStatus();
	processing_asset_session = false;
});

$(document).on('assetOrderMatchesLoaded',function(e) {
	console.log('assetOrderMatchesLoaded');
	updateAssetOrderMatches();
	//getAssetSession();
	//sessionDataLoaded();
	updateDeltas();
});

$(document).on('sessionLoaded',function(e) {
	//console.log('sessionLoaded');
	//updateAssetOrderMatches();
	updateAssetSession();
	setScheduleIntervals();
	updateAssetOrders();
});

$(document).on('socketConnected',function(e) {
	if($("#context-container").length>0) {
	}
	if($("#asset-orders-container").length>0) {
		// add parser through the tablesorter addParser method
		$.tablesorter.addParser({
			// set a unique id
			id: 'decimal',
			is: function(s) {
				// return false so this parser is not auto detected
				return false;
			},
			format: function(s) {
				// format your data for normalization
				if(currentLang == 'EN') {
					return s.replace(/\,/g,'')*1;
				}
				else {
					return s.replace(/\./g,'').replace(',','.')*1;
				}
			},
			// set type, either numeric or text
			type: 'numeric'
		});
		$.tablesorter.addParser({
			// set a unique id
			id: 'price',
			is: function(s) {
				// return false so this parser is not auto detected
				return false;
			},
			format: function(s) {
				// format your data for normalization
				if(currentLang == 'EN') {
					return s.replace(/\,/g,'')*1;
				}
				else {
					return s.replace(/\./g,'').replace(',','.')*1;
				}
			},
			// set type, either numeric or text
			type: 'numeric'
		});
		$.tablesorter.addParser({
			// set a unique id
			id: 'quantity',
			is: function(s) {
				// return false so this parser is not auto detected
				return false;
			},
			format: function(s) {
				// format your data for normalization
				return s.replace(' MWh','');
			},
			// set type, either numeric or text
			type: 'numeric'
		});
		if($(".client-order-code").length>0) {
			var tableHeader = {
				0: {
				},
				1: {
				},
				2: {
					sorter:'decimal'
				},
				3: {
					sorter:'decimal'
				},
				4: {
				},
				5: {
				},
				6: {
					sorter:false
				}
			};
		}
		else {
			var tableHeader = {
				0: {
				},
				1: {
					sorter:'decimal'
				},
				2: {
					sorter:'decimal'
				},
				3: {
				},
				4: {
				},
				5: {
					sorter:false
				}
			};
		}

		//sortList:[[($(".client-order-code").length>0?3:2),1],[($(".client-order-code").length>0?2:1),0]],
		$("#buy-orders-list").tablesorter({
			cssHeader: 'header-column',
			headers: tableHeader,
			sortList:[[($(".client-order-code").length>0?3:2),1],[0,0]],
			sortAppend: [[0,0]]
		});
		$("#sell-orders-list").tablesorter({
			cssHeader: 'header-column',
			headers: tableHeader,
			sortList:[[($(".client-order-code").length>0?3:2),0],[0,0]],
			sortAppend: [[0,0]]
		});

		$(document).on('click','.download-docs',function(e) {
			e.preventDefault();
		});

		$('#documents-modal').on('shown.bs.modal', function (event) {
			var modal = $(this);
			var clientsTable = $("#documents-table").data('footable');
			var tbody = modal.find("#documents-table tbody");
			tbody.find("tr").remove();
			modal.find('.empty-msg').remove();
			clientsTable.redraw();
			newSailsSocket.get('/asset/documents', {ID_Asset:context.asset_id}, function(response) {
				if(response.Success) {
					if(response.Result.length>0) {
						$("#documents-table").show();
						$("#documents-table-filter").show();
						for(var i=0;i<response.Result.length;i++) {
							tbody.append('<tr><td>'+response.Result[i].Name+'</td><td>'+getTranslation(response.Result[i].DocumentType)+'</td><td><a href="'+response.Result[i].DocumentURL+'" target="_blank"><i class="fa fa-download"></i></a></td></tr>');
						}
						clientsTable.redraw();
					}
					else {
						$("#documents-table").hide();
						$("#documents-table-filter").hide();
						modal.find('.modal-body').append('<p style="text-align:center" class="empty-msg">Nu exista documente atasate la sedinta.</p>')
					}
				}
				else {
					log('get asset documents: '+response.Result);
				}
			});
		});

		$('#parameters-modal').on('shown.bs.modal', function (event) {
			var modal = $(this);
			var form = $("#parameters-form");
			form[0].reset();
			modal.find('.alert.error').remove();
			newSailsSocket.get('/asset/parameters', {ID_Asset:context.asset_id}, function(response) {
				var asset = response.Result;
				if(response.Success) {
					var startdate = new moment(asset.StartDate);
					var enddate = new moment(asset.EndDate);
					$("#params_ID_Asset").val(context.asset_id);
					$("#params_StartDate").val(startdate.format('DD MMM YYYY'));
					$("#params_EndDate").val(enddate.format('DD MMM YYYY'));
					var parts1 = asset.PreOpeningTime.split(':');
					if(parts1.length==3) $("#params_PreOpeningTime").val(parts1[0]+':'+parts1[1]);
					else {
						$("#params_PreOpeningTime").val(asset.PreOpeningTime);
					}
					var parts2 = asset.OpeningTime.split(':');
					if(parts2.length==3) $("#params_OpeningTime").val(parts2[0]+':'+parts2[1]);
					else {
						$("#params_OpeningTime").val(asset.OpeningTime);
					}
					var parts3 = asset.PreClosingTime.split(':');
					if(parts3.length==3) $("#params_PreClosingTime").val(parts3[0]+':'+parts3[1]);
					else {
						$("#params_PreClosingTime").val(asset.PreClosingTime);
					}
					var parts4 = asset.ClosingTime.split(':');
					if(parts4.length==3) $("#params_ClosingTime").val(parts4[0]+':'+parts4[1]);
					else {
						$("#params_ClosingTime").val(asset.ClosingTime);
					}
					$("#params_dayMonday").prop('checked',asset.dayMonday);
					$("#params_dayTuesday").prop('checked',asset.dayTuesday);
					$("#params_dayWednesday").prop('checked',asset.dayWednesday);
					$("#params_dayThursday").prop('checked',asset.dayThursday);
					$("#params_dayFriday").prop('checked',asset.dayFriday);
					$("#params_daySaturday").prop('checked',asset.daySaturday);
					$("#params_daySunday").prop('checked',asset.daySunday);
					$("#params_DeltaT").val(asset.DeltaT);
					$("#params_DeltaT1").val(asset.DeltaT1);
					$("#params_PartialFlagChangeAllowed").prop('checked',asset.PartialFlagChangeAllowed);
					$("#params_InitialPriceMandatory").prop('checked',asset.InitialPriceMandatory);
					$("#params_InitialPriceMaintenance").prop('checked',asset.InitialPriceMaintenance);
					$("#params_DiminishedQuantityAllowed").prop('checked',asset.DiminishedQuantityAllowed);
					$("#params_DiminishedPriceAllowed").prop('checked',asset.DiminishedPriceAllowed);
					$("#params_OppositeDirectionAllowed").prop('checked',asset.OppositeDirectionAllowed);
					$("#params_DifferentialPriceAllowed").prop('checked',asset.DifferentialPriceAllowed);
					if(asset.DifferentialPriceAllowed) {
						$("#params_DifferentialPriceText").val(asset.DifferentialPriceText);
						$("#DifferentialPriceText-holder").show();
					}
					else {
						$("#DifferentialPriceText-holder").hide();
					}
					$("#params_PriceStepping").val(('' + asset.PriceStepping).replace('.', ','));
					$("#params_QuantityStepping").val(('' + asset.QuantityStepping).replace('.', ','));
					$("#params_MaxPriceVariation").val(('' + asset.MaxPriceVariation).replace('.', ','));
					$("#params_MinPrice").val(('' + asset.MinPrice).replace('.', ','));
					$("#params_MinQuantity").val(('' + asset.MinQuantity).replace('.', ','));
					$("#params_MaxPrice").val(('' + asset.MaxPrice).replace('.', ','));
					$("#params_SellWarrantyFixed").val(asset.SellWarrantyFixed);
					$("#params_SellWarrantyMU").val(asset.SellWarrantyMU);
					$("#params_SellWarrantyPercent").val(asset.SellWarrantyPercent);
					$("#params_BuyWarrantyFixed").val(asset.BuyWarrantyFixed);
					$("#params_BuyWarrantyMU").val(asset.BuyWarrantyMU);
					$("#params_BuyWarrantyPercent").val(asset.BuyWarrantyPercent);
					$('.numeric').autoNumeric('destroy');
					$('.numeric').autoNumeric('init');
				}
				else {
					modal.find('.modal-body').prepend('<div class="alert alert-error error"><button class="close" data-dismiss="alert"></button><p>'+response.Result+'</p></div>');
					window.scrollTo(0,0);
					log('get asset parameters: '+response.Result);
				}
			});
		});

		$("#params_DifferentialPriceAllowed").on('change',function(e){
			if($(this).is(":checked")) $("#DifferentialPriceText-holder").show();
			else $("#DifferentialPriceText-holder").hide();
		});

		$('#params_StartDate').datepicker({
			dateFormat:'dd MMM yyyy',
			autoclose:true,
			orientation:'auto top'
		});
		$('#params_EndDate').datepicker({
			dateFormat:'dd MMM yyy',
			autoclose: true,
			orientation:'auto top'
		});

		$('body').on('click',"#save-parameters",function(e) {
			e.preventDefault();
			var $modal = $("#parameters-modal");
			$.post('/asset/save_parameters', $("#parameters-form").serialize(), function(response) {
				if(response.Success) {
					$modal.modal('hide');
				}
				else {
					$modal.find('.modal-body').prepend('<div class="alert alert-error error"><button class="close" data-dismiss="alert"></button><p>'+response.Result+'</p></div>');
					window.scrollTo(0,0);
					log('save asset parameters: '+response.Result);
				}
			});
		});

		$(document).on('click','.suspend-order-button',function (e) {
			e.preventDefault();
			var ok = true;
			var $orderId = $(this).attr('data-value');
			var $url = $(this).attr('href');
			var $this = $(this);
			var suspended = true;
			if($this.closest('tr').hasClass('suspended')) {
				var suspended = false;
			}
			$.post($url,{suspended: suspended},function(data,textStatus){
				if(!data.Success) {
					if(data.ResultType=='JSONKeyValuePairStruct') {
						fancyAlert(data.Result);
						ok = false;
					}
					else if(data.ResultType=='GeneralError' || data.ResultType=='String') {
						fancyAlert(data.Result);
					}
				}
				else if(data.Success) {
					if(suspended) {
						$this.addClass('selected');
					}
					else {
						$this.removeClass('selected');
					}
				}
			});
		});

		newSailsSocket.on('order', function(message) {
			console.log('EVENT: order');
			if(message.data.item.ID_Asset == context.asset_id) {
				if((message.data.item.ID_Agency==a_id || message.data.item.ID_Broker==b_id) && Object.keys(context.ownOrders).length==0) {
					getAssetOrders();
				}
				else {
					processAssetOrder(message.data.item,updateAssetOrder);
				}

        getAssetSession();
			}
		});

		newSailsSocket.on('transaction', function(message) {
			console.log('EVENT: transaction');
			//console.log(message);
			if(typeof message.data.ID_Asset != 'undefined' && message.data.ID_Asset && message.data.ID_Asset == context.asset_id && context.assetSession) {
				context.orderMatches = [];
				$("#buy-orders-list .match").removeClass('match');
				$("#sell-orders-list .match").removeClass('match');
			}
			getAssetOrderMatches();
			//getAssetOrders();
		});

		newSailsSocket.on('deltat', function(message) {
			console.log('EVENT: delta t');
			var dt = message.data;
			if(dt.ID_Asset==context.asset_id && context.assetSession) {
				var order = context.assetOrders[dt.ID_Order];
				if(order) {
					if(!order.isInitial && (dt.ID_Agency==a_id || dt.ID_Broker==b_id)) {
						context.DeltaTRemaining = dt.DeltaTRemaining;
						//$("#delta-t").html(getRemainingTime(dt.DeltaTRemaining));
						//console.log(message);
						if(dt.DeltaTRemaining == 0 && !context.ordonator) {
							//console.log('hide buttons');
							$("#sell-orders .edit-order-button").hide();
							//$("#sell-orders .cancel-order-button").hide();
							$("#buy-orders .edit-order-button").hide();
							//$("#buy-orders .cancel-order-button").hide();
						}
						else if(dt.DeltaTRemaining > 0 && !context.ordonator && (context.assetSession.PreOpeningTime == context.assetSession.OpeningTime && context.assetSession.Status == 'Opened')) {
							//console.log('delta t running and should change orders');
							for(var ownOrder in context.ownOrders) {
								//console.log(ownOrder);
								if(context.ownOrders[ownOrder].isActive && !context.ownOrders[ownOrder].isSuspended && !context.ownOrders[ownOrder].isTransacted) {
									//console.log('show edit button');
									$("#asset-order-"+ownOrder+" .edit-order-button").show();
								}
							}
						}
						context.deltaTStarted = true;
						clearTimeout(context.deltaTTimer);
						context.deltaTTimer = setTimeout(function() {
							context.deltaTStarted = false;
						},1100);
					}
				}
			}
		});

		newSailsSocket.on('deltatbroker', function(message) {
			//console.log('EVENT: delta t broker');
			var dt = message.data;
			if(dt.ID_Asset==context.asset_id && context.assetSession && dt.ID_Broker==b_id) {
				context.DeltaTRemaining = dt.DeltaTRemaining;
				//$("#delta-t").html(getRemainingTime(dt.DeltaTRemaining));
				context.deltaTStarted = true;
				clearTimeout(context.deltaTTimer);
				context.deltaTTimer = setTimeout(function() {
					context.deltaTStarted = false;
				},1100);
			}
		});

		newSailsSocket.on('deltat1', function(message) {
			console.log('EVENT: delta t1');
			var dt1 = message.data.item;
			if(dt1.ID_Asset==context.asset_id && context.assetSession) {
				var order = context.assetOrders[dt1.ID_Order];
				if(order) {
					//if((order.isInitial && dt1.ID_Agency==a_id) || dt1.ID_Broker==b_id) {
						context.DeltaT1Remaining = dt1.DeltaT1Remaining;
						//$("#delta-t1").html(getRemainingTime(dt1.DeltaT1Remaining));
						//if(dt.DeltaT1Remaining == 0) {
							//getAssetOrderMatches();
							//getBrokerClients();
							//getAssetOrders();
							//getAssetSession();
						//}
						//else {
							$("#delta-t1").addClass('dt1-started');
							context.deltaT1Started = true;
							clearTimeout(context.deltaT1Timer);
							context.deltaT1Timer = setTimeout(function() {
								context.deltaT1Started = false;
								$("#delta-t1").removeClass('dt1-started');
							},1100);
						//}
					//}
				}
			}
		});

		newSailsSocket.on('deltat1broker', function(message) {
			//console.log('EVENT: delta t1 broker');
			var dt1 = message.data;
			//console.log('deltat1 message');
			if(dt1.ID_Asset==context.asset_id && context.assetSession && dt1.ID_Broker==b_id) {
				context.DeltaT1Remaining = dt1.DeltaT1Remaining;
				//$("#delta-t1").html(getRemainingTime(dt1.DeltaT1Remaining));
				$("#delta-t1").addClass('dt1-started');
				context.deltaT1Started = true;
				clearTimeout(context.deltaT1Timer);
				context.deltaT1Timer = setTimeout(function() {
					context.deltaT1Started = false;
					$("#delta-t1").removeClass('dt1-started');
				},1100);
			}
		});

		newSailsSocket.on('ordermatch', function(message) {
			console.log('EVENT: order match');
			if(typeof context.assetOrders[message.data.item.ID_Resource] != 'undefined' || typeof context.assetOrders[message.data.item.ID_LinkedResource] != 'undefined') {
				getAssetOrderMatches();
				console.log(message);
				if(message.data.isDeleted) {
					$("#delta-t1").html(context.assetSession.DeltaT1);
				}
			}
		});

		newSailsSocket.on('assetsession', function(message) {
			console.log('EVENT: asset session');
			if(context.assetSession && message.id == context.assetSession.ID_Asset) {
				context.asset = getArrayItem(assets,context.asset_id);
				//resetAssetSessionContext();
				//resetOrderForm();
				//resetAssetSession();
        onContextChanged();
				//getAssetOrderMatches();
				//getBrokerClients();
				//getAssetOrders();
				//getAssetSession();
			}

			if(typeof getAllRings == 'function') {
				getAllRings();
			}
		});

		/*
		newSailsSocket.on('message', function(message) {
			if(message.model=='order') {
				if(message.data.item.ID_Asset==context.asset_id) {
					processAssetOrder(message.data.item,updateAssetOrder);
				}
			}
			if(message.model=='transaction') {
				getAssetOrderMatches();
			}
			if(message.model=='deltat') {
				var dt = message.data.item;
				if(dt.ID_Asset==context.asset_id && context.assetSession) {
					var order = searchIdInArray(dt.ID_Order,context.assetOrders);
					if(order>-1) {
						if((context.assetOrders[order].isInitial && dt.ID_Agency==a_id) || dt.ID_Broker==b_id) {
							log(dt.DeltaTRemaining);
							$("#delta-t").html(getRemainingTime(dt.DeltaTRemaining));
						}
					}
				}
			}
			if(message.model=='deltat1') {
				var dt1 = message.data.item;
				if(dt1.ID_Asset==context.asset_id && context.assetSession) {
					var order = searchIdInArray(dt1.ID_Order,context.assetOrders);
					if(order>-1) {
						if((context.assetOrders[order].isInitial && dt1.ID_Agency==a_id) || dt1.ID_Broker==b_id) {
							log(dt1.DeltaT1Remaining);
							$("#delta-t1").html(getRemainingTime(dt1.DeltaT1Remaining));
						}
					}
				}
			}
			if(message.model=='ordermatch') {
				if(searchIdInArray(message.data.item.ID_Resource,context.assetOrders) || searchIdInArray(message.data.item.ID_LinkedResource,context.assetOrders)) {
					getAssetOrderMatches();
					if(message.data.isDeleted) {
						$("#delta-t1").html(context.assetSession.DeltaT1)
					}
				}
			}
			else if(message.model=='assetsession') {
				if(context.assetSession && message.id == context.assetSession.ID_Asset) {
					context.asset = getArrayItem(assets,context.asset_id);
					//resetAssetSessionContext();
					//resetOrderForm();
					//resetAssetSession();
					getAssetOrderMatches();
					getBrokerClients();
					getAssetOrders();
					getAssetSession();
				}
				if(typeof getAllRings == 'function') {
					getAllRings();
				}
			}
		});
		*/
	}
});
$(function () {
	$('.footable').footable();
});


