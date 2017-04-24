/****** data functions ***************/

var initialOrders = [];

function getInitialOrders(clear) {
	log('updating initial orders')
	newSailsSocket.get('/order/initial', {}, function(response) {
		if(response.Success) {
			log('receiving '+response.Result.length+' initial orders')
			if(response.Result.length>0) {
				if(clear || $("#initialOrders-list").length==0) {
					initialOrders = [];
					$("#initialOrders-container .tile-body").html('<table class="table no-more-tables no-margin" id="initialOrders-list">'+
						'<thead>'+
							'<tr>'+
								'<th style="width:10%" class="">'+getTranslation('Hour')+'</th>'+
								'<th style="width:5%">'+getTranslation('Client')+'</th>'+
								'<th style="width:5%">'+getTranslation('Type')+'</th>'+
								'<th style="width:5%">'+getTranslation('Asset_name')+'</th>'+
								'<th style="width:5%">'+getTranslation('Asset_code')+'</th>'+
								'<th style="width:5%">UM</th>'+
								'<th style="width:5%">'+getTranslation('Asset_type')+'</th>'+
								'<th style="width:5%">'+getTranslation('Quantity')+'</th>'+
								'<th style="width:5%" class="">'+getTranslation('Price')+' <span>(Lei)</span></th>'+
								'<th style="width:5%">'+getTranslation('Availability')+'</th>'+
								'<th style="width:5%">'+getTranslation('Partial')+'</th>'+
								'<th style="width:10%">&nbsp;</th>'+
							'</tr>'+
						'</thead>'+
						'<tbody>'+
						'</tbody>'+
					'</table>');
				}
				for (var i=0;i<response.Result.length;i++) {
					appendInitialOrder(response.Result[i]);
				}
				if($("#initialOrders-list tbody tr").length==0) {
					$("#initialOrders-container .tile-body").html('<div class="text-center">'+getTranslation('No_initial_order_available')+'</div>');
				}
			}
			else {
				if(clear) {
					log('clean up initial orders..');
					$("#initialOrders-container .tile-body").html('<div class="text-center">'+getTranslation('No_initial_order_available')+'</div>');
				}
			}
		}
		else {
			parseResponse('getInitialOrders',response);
		}
	});
}

/****** view functions ***************/

function appendInitialOrder(item) {
	if(searchIdInArray(item.ID,initialOrders)==-1) {
		log('new initial order '+item.ID);
		if(!item.isTransacted && !item.isSuspended && !item.isCanceled && !item.isApproved && item.isActive) {
			initialOrders.push(item);
			var d = new moment(item.Date);
			var ring = rings[searchIdInArray(item.ID_Ring,rings)];
			var asset = assets[searchIdInArray(item.ID_Asset,assets)];
			if(!asset) {
				log('asset not found #'+item.ID_Asset);
				return false;
			}
			var asset_type = assetTypes[searchIdInArray(asset.ID_AssetType,assetTypes)];
			if(!asset_type) {
				log('asset type not found #'+item.ID_AssetType);
				return false;
			}
			$("#initialOrders-list tbody").append('<tr>'+
				'<td class="v-align-middle">' + d.format('DD MMM HH:mm') + '</td>'+
				'<td class="v-align-middle">' + item.ID_Client + '</td>'+
				'<td class="v-align-middle"><span class="' + (item.Direction=='S'?'sell':'buy') + ' semi-bold">' + (item.Direction=='S'?'ASK':'BID') + '</span></td>'+
				'<td class="v-align-middle">' + getTranslation(asset.Name) + '</td>'+
				'<td class="v-align-middle">' + asset.Code + '</td>'+
				'<td class="v-align-middle">' + getTranslation(asset.MeasuringUnit) + '</td>'+
				'<td class="v-align-middle">' + getTranslation(asset_type.Name) + '</td>'+
				'<td class="v-align-middle">' + $.number(item.Quantity,2,',','.') + '</td>'+
				'<td class="v-align-middle">' + $.number(item.Price,2,',','.') + '</td>'+
				'<td class="v-align-middle"></td>'+
				'<td class="v-align-middle"></td>'+
				'<td class="v-align-middle actions"><a class="approve-order btn btn-small btn-white" href="/orders/approve/' + item.ID + '" title="'+getTranslation('Approve')+'"><i class="fa fa-check"></i></a>&nbsp;&nbsp;<a class="reject-order btn btn-small btn-white" href="/orders/reject/' + item.ID + '" title="'+getTranslation('Reject')+'"><i class="fa fa-times"></i></a></td>'+
			'</tr>');
		}
	}
}

/******* events **********/

$(document).on('assetsLoaded',function(e,clear) {
	if($("#initialOrders-container").length>0) {
		getInitialOrders(true);
	}
});

$(document).on('socketConnected',function(e) {
	if($("#initialOrders-container").length>0) {
		$(document).on('click','.approve-order',function (e) {
			e.preventDefault();
			$this = $(this);
			var msg = getTranslation('Initial_order_approve_confirm');
			fancyConfirm(msg,function(r){ 
				if(r) {
					$.post($this.attr('href'), {}, function(response) {
						if(response.Success) {
							fancyAlert(getTranslation('Order_approved'));
						}
						else {
							fancyAlert(response.Result);
						}
					});
				}
			});
		});
		
		$(document).on('click','.reject-order',function (e) {
			e.preventDefault();
			$this = $(this);
			var msg = getTranslation('Initial_order_reject_confirm');
			fancyConfirm(msg,function(r){ 
				if(r) {
					$.post($this.attr('href'), {}, function(response) {
						if(response.Success) {
							fancyAlert(getTranslation('Order_rejected'));
						}
						else {
							fancyAlert(response.Result);
						}
					});
				}
			});
		});
	}
});


