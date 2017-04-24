/****** data functions ***************/

var orders = [];
var edit_order_trigger = false;
var formSubmitted = false;
var successShown = false;

function getOrders(clear) {
	newSailsSocket.get('/order', {all:true}, function(response) {
		if(response.Success) {
			if(clear) {
				orders = [];
			}
			if(response.Result && response.Result.length>0) {
				for (var i=0;i<response.Result.length;i++) {
					processOrder(response.Result[i]);
				}
			}
			$.event.trigger('ordersLoaded',clear);
		}
		else {
			parseResponse('getOrders',response);
		}
	});
}

function processOrder(item) {
	var idx = searchIdInArray(item.ID,orders);
	if(idx == -1) {
		orders.push(item);
		$.event.trigger({type:'orderUpdated',ID_Order:item.ID});
	}
	else if(objectChanged(item,orders[idx])) {
		orders[idx] = item;
		$.event.trigger({type:'orderUpdated',ID_Order:item.ID});
	}
}


/****** view functions ***************/

function updateOrder(id) {
	var $item = $("#order-"+id);
	var item = getArrayItem(orders,id);
	if(item) {
		//var asset = getArrayItem(assets,item.ID_Asset);
		//if(asset) {
			if(item.ID_Broker==b_id || (item.ID_Agency==a_id && item.isInitial) || item.ID_Client==c_id) {
				var $list = $("#orders-list");
				if(item.isCanceled || item.isTransacted || !item.isActive) {
					$item.remove();
					$.event.trigger({type:'orderClosed',ID_Order:item.ID});
				}
				else {
					var html = $list.data('prototype');
					if(typeof html == 'undefined') {
						log('orders list has no prototype');
					}
					else {
						html = getPrototypeData(item,html);
						if($item.length>0) {
							$item.replaceWith(html);
						}
						else {
							$list.append(html);
						}
						$.event.trigger({type:'orderShown',ID_Order:item.ID});
					}
				}
			}
		//}
	}
	else {
		log('order #'+id+' not found');
	}
}

function updateOrderData(id) {
	var $item = $("#order-"+id);
	var item = getArrayItem(orders,id);
	if(item) {
	//log('updating order #'+item.ID);
		var asset = getArrayItem(assets,item.ID_Asset);
		if(asset) {
			if(asset.ID_InitialOrder && asset.ID_InitialOrder != item.ID) {
				var initialOrder = getArrayItem(orders,asset.ID_InitialOrder);
			}
			else var initialOrder = item;
			if(!asset.isActive) $item.addClass('suspended').attr('title',getTranslation('Order_awaits_approval'));
			$item.find('.own-order-asset-name').html(getTranslation(asset.Name));
			$item.find('.own-order-id').html('#' + item.ID);
			$item.find('.own-order-direction').html((item.Direction=='S' ? 'ASK' : 'BID'));
			$item.find('.own-order-quantity').html(localeNumber(item.Quantity,2));
			$item.find('.own-order-measuring-unit').html(measuringUnits[searchIdInArray(asset.ID_MeasuringUnit,measuringUnits)].Code);
			$item.find('.own-order-initial-measuring-unit').html(measuringUnits[searchIdInArray(asset.ID_MeasuringUnit,measuringUnits)].Code);
			$item.find('.own-order-currency').html(currencies[searchIdInArray(asset.ID_Currency,currencies)].Code);
			$item.find('.own-order-initial-currency').html(currencies[searchIdInArray(asset.ID_Currency,currencies)].Code);
			$item.find('.own-order-expiration-date').html(moment(item.ExpirationDate).format('DD MMM HH:mm'));
			if(item.Price!==null) {
				$item.find('.own-order-price').html(localeNumber(item.Price,2));
			}
			else {
				$item.find('.own-order-price-set').hide(0);
			}
			if(initialOrder&& initialOrder.ID !=item.ID) {
				//$item.find('.own-order-initial-id').html(initialOrder.ID);
				$item.find('.own-order-initial-direction').html((initialOrder.Direction=='S' ? 'ASK' : 'BID'));
				$item.find('.own-order-initial-quantity').html(localeNumber(initialOrder.Quantity,2));
				//$item.find('.own-order-initial-price').html(localeNumber(initialOrder.Price,2,',','.'));
				if(initialOrder.Price!==null) {
					$item.find('.own-order-initial-price').html(localeNumber(initialOrder.Price,2));
				}
				else {
					$item.find('.own-order-initial-price-set').hide(0);
				}
			}
			else {
				$item.find('.own-order-initial').hide(0);
			}
			if(asset.Status!='PreOpened' && asset.Status!='Opened' && asset.Status!='PreOpened') {
				$item.find('.order-actions').hide(0);
			}
		}
		else {
			$item.remove();
			log('asset #'+item.ID_Asset+' not found');
		}
	}
	else {
		log('order #'+id+' not found');
	}
}

function getSteppingDecimal(val) {
	var match = (''+val).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
	if (!match) { return 0; }
	return Math.max(
       0,
       // Number of digits right of decimal point.
       (match[1] ? match[1].length : 0)
       // Adjust for scientific notation.
       - (match[2] ? +match[2] : 0));
}

/******** logic *************/

$(document).on('orderUpdated',function(e) {
	updateOrder(e.ID_Order);
});

$(document).on('orderShown',function(e) {
	updateOrderData(e.ID_Order);
});

$(document).on('ordersLoaded',function(e) {
	$("#orders-container .loader").hide(0);
});

$(document).on('assetsLoaded',function(e,clear) {
	getOrders(clear);
});

function closeEditForm() {
	if(typeof resetOrderForm == 'function') {
		resetOrderForm();
	}
	var $container = $("#order-form-container");
	$container.hide(0);
	if($("#main-menu-toggle-wrapper").is(":visible")) {
		$('html, body').animate({
			scrollTop: $("#asset-orders-container").offset().top
		}, 200);
	}
}

$(document).on('socketConnected',function(e) {
	if($("#orders-container").length>0) {
		$(document).on('click','#order-cancel',function (e) {
			e.preventDefault();
			closeEditForm();
		});

		$(document).on('click','.add-order-button',function (e) {
      e.preventDefault();

      addOrder($(this).data('type'), $(this).data('intial'));
		});

    $(document).on('click','.add-matching-order',function (e) {
      e.preventDefault();

      if (context.asset.AuctionType == 'simple' && context.ordonator) {
        var add = true,
          orderId = null,
          direction = 'B';

        if (context.assetOrders[$(this).data('value')].Direction == 'B') {
          direction = 'S';
        }

        for (var id in context.assetOrders) {
          if (context.assetOrders[id].Direction == direction) {
            add = false;
            orderId = id;
          }
        }

        if (add) {
          addMatchingOrder($(this).data('value'));
        }
        else {
          editOrder(orderId, $(this).data('value'));
        }
      }
      else {
        addMatchingOrder($(this).data('value'));
      }
    });

    $(document).on('click','.edit-order-button',function (e) {
      e.preventDefault();

      editOrder($(this).data('value'));
    });

    function addOrder (type, initial) {
      if(typeof resetOrderForm == 'function') {
        resetOrderForm();
      }
      $container = $("#order-form-container");
      $orderform = $("#order-form");
      if(initial) {
        $("#order-isInitial").val('1');
        $("#order-ID_Asset").val('-1');
        $(".order-asset-holder").html('');
        $("#new-asset-form").show(0);
      }
      else {
        $("#order-isInitial").val('0');
        var asset = context.asset;
        if(!asset) {
          showError(getTranslation('Asset_not_selected'));
        }
        if(context.assetSession) {
          //if(context.assetSession.MinQuantity) $("#order-Quantity").val(0);
          //$("#order-Price").val(initial_order.Price);
        }
        $("#order-ID_Asset").val(asset.ID);
        $("#order-ID_Ring").val(asset.ID_Ring);
        $(".order-asset-holder").html(' '+getTranslation('on_asset')+' '+getTranslation(asset.Name));
        $("#order-Quantity").parent().find('.input-placeholder').html(asset.MeasuringUnit);
        $("#new-asset-form").hide(0);
      }
      for(var i=0;i<context.brokerClients.length;i++) {
        $("#order-ID_Client").append('<option value="'+context.brokerClients[i].ID_Client+'">'+context.brokerClients[i].Code+'</option>');
      }
      if(context.brokerClients.length>1) {
        $("#order-ID_Client")[0].selectedIndex = -1;
        $("#clientWarranties").html('');
      }
      else if(context.brokerClients.length==1) {
        $("#clientWarranties").html('<strong>'+context.brokerClients[0].AvailableWarranty+'</strong> Lei');
      }
      $(".order-action-title").html(getTranslation('Addition'));
      $("#order-submit").html(getTranslation('Publish_order'));
      var date = new Date(Date.now());
      $('#order-Date').datepicker('setStartDate', date);
      $('#order-Date').datepicker('setDate', date);
      $("#order-Time").val('23:59:00');
      $("#order-Time").timepicker('setTime','23:59:00');
      if(type=='B') {
        $(".order-direction-holder").html(getTranslation('buy_label'));
        $("#order-Direction").val(type);
        $(".entryPoints-holder").hide(0);
      }
      else {
        $(".order-direction-holder").html(getTranslation('sell_label'));
        $("#order-Direction").val(type);
        $(".entryPoints-holder").show(0);
      }
      if(context.assetSession.DifferentialPriceAllowed) {
        //console.log('allow negative price');
        $("#order-Price").autoNumeric('update', {vMin:-9999999});
      }
      else {
        $("#order-Price").autoNumeric('update', {vMin:0});
      }
      //$("#orders-container").hide(0);
      $orderform.removeClass('edit-form');
      $container.show(0);

      if($("#main-menu-toggle-wrapper").is(":visible")) {
        $('html, body').animate({
          scrollTop: $("#order-form-container").offset().top
        }, 200);
      }
    }

    function addMatchingOrder (id) {
      $container = $("#order-form-container");
      $orderform = $("#order-form");

      var item = orders[searchIdInArray(id,orders)];
      var asset = typeof item!='undefined' ? assets[searchIdInArray(item.ID_Asset,assets)] : null;
      if($container.is(":visible")) {
        // just change quantity, price and partial attribute
        if(context.assetSession.QuantityStepping!==null) {
          var qs = getSteppingDecimal(context.assetSession.QuantityStepping);
        }
        else var qs = 2;
        if(context.assetSession.PriceStepping!==null) {
          var ps = getSteppingDecimal(context.assetSession.PriceStepping);
        }
        else var ps = 2;
        $("#order-Quantity").val(localeNumber(item.Quantity,qs));
        $("#order-Price").val(localeNumber(item.Price,ps));
        if(item.isPartial) {
          $("#partial").prop('checked',true);
          $("#total").prop('checked',false);
        }
        else {
          $("#partial").prop('checked',false);
          $("#total").prop('checked',true);
        }
      }
      else {
        if(context.asset_id && context.ring_id && context.assetSession) {
          var userOrders = [];
          var bestOrder = null;
          for(var i=0;i<context.assetOrders.length;i++) {
            if(context.assetOrders[i].ID_Broker==b_id || (context.assetOrders[i].ID_Agency==a_id && context.assetOrders[i].isInitial)) {
              userOrders.push(context.assetOrders[i]);
              if(!bestOrder) {
                bestOrder = context.assetOrders[i];
              }
              else if(context.assetOrders[i].Direction=='B' && context.assetOrders[i].Price>bestOrder.Price){
                bestOrder = context.assetOrders[i];
              }
              else if(context.assetOrders[i].Direction=='S' && context.assetOrders[i].Price<bestOrder.Price){
                bestOrder = context.assetOrders[i];
              }
            }
          }
          if(bestOrder) {
            editOrderForm(bestOrder,item);
            return;
          }
          else if(userOrders.length==1) {
            editOrderForm(userOrders[0],item);
            return;
          }
        }
        // add reverse order
        if(typeof resetOrderForm == 'function') {
          resetOrderForm();
        }
        if(context.assetSession.QuantityStepping!==null) {
          var qs = getSteppingDecimal(context.assetSession.QuantityStepping);
        }
        else var qs = 2;
        if(context.assetSession.PriceStepping!==null) {
          var ps = getSteppingDecimal(context.assetSession.PriceStepping);
        }
        else var ps = 2;
        $("#order-Quantity").val(localeNumber(item.Quantity,qs));
        $("#order-Price").val(localeNumber(item.Price,ps));
        if(currentLang == 'EN') {
          $("#order-Quantity").data('a-sep',',');
          $("#order-Quantity").data('a-dec','.');
          $("#order-Quantity").autoNumeric('update',{aDec:'.', aSep:','});
          $("#order-Price").data('a-sep',',');
          $("#order-Price").data('a-dec','.');
          $("#order-Price").autoNumeric('update',{aDec:'.', aSep:','});
        }

        $("#order-ID").val('');
        $("#order-Direction").val(item.Direction=='B'?'S':'B');
        $("#order-ID_Ring").val(item.ID_Ring);
        $("#order-ID_Asset").val(item.ID_Asset);
        var now = new Date();
        var date = new moment(now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate(),'YYYY-MM-DD');
        $("#order-Date").val(date.format('DD MMM YYYY'));
        $("#order-Time").val('23:59:00');
        $("#order-Time").timepicker('setTime','23:59:00');
        $(".order-action-title").html(getTranslation('Addition'));
        $("#order-submit").html(getTranslation('Add'));
        $orderform.removeClass('edit-form');
        for(var i=0;i<context.brokerClients.length;i++) {
          $("#order-ID_Client").append('<option value="'+context.brokerClients[i].ID_Client+'">'+context.brokerClients[i].Code+'</option>');
        }
        if(context.brokerClients.length>1) {
          $("#order-ID_Client")[0].selectedIndex = -1;
        }
        if(item.isPartial) {
          $("#partial").prop('checked',true);
          $("#total").prop('checked',false);
        }
        else {
          $("#partial").prop('checked',false);
          $("#total").prop('checked',true);
        }
        //$("#total").prop('checked',true);
        //$("#total").prop('disabled',false);
        //$("#partial").prop('disabled',false);
        if(item.Direction=='B') {
          $(".order-direction-holder").html(getTranslation('sell'));
        }
        else {
          $(".order-direction-holder").html(getTranslation('buy'));
        }
        $(".order-asset-holder").html(' '+getTranslation('on_asset')+' '+getTranslation(asset.Name));
        $container.show(0);
      }

      if($("#main-menu-toggle-wrapper").is(":visible")) {
        $('html, body').animate({
          scrollTop: $("#order-form-container").offset().top
        }, 200);
      }
      /*
       $('html, body').animate({
       scrollTop: $("#asset-orders-container").offset().top
       }, 400);
       */
    }

    function editOrder (id, newOrderId) {
      var item = orders[searchIdInArray(id,orders)];
      var match = null;

      if (newOrderId) {
        match = orders[searchIdInArray(newOrderId,orders)];
      }

      if(!context.asset || !context.ring) {
        edit_order_trigger = true;
        changeContext(item.ID_Ring,item.ID_Asset);
        $(document).on('contextChanged',function(e) {
          //console.log(edit_order_trigger);
          if(edit_order_trigger) {
            editOrderForm(item, match);
            edit_order_trigger = false;
          }
        });
      }
      else {
        editOrderForm(item, match);
      }
    }

		function editOrderForm(item,match) {
			if(typeof resetOrderForm == 'function') {
				resetOrderForm();
			}
			$container = $("#order-form-container");
			$orderform = $("#order-form");
			var asset = assets[searchIdInArray(item.ID_Asset,assets)];

			$("#order-ID").val(item.ID);
			$("#order-Direction").val(item.Direction);
			if(context.assetSession.QuantityStepping!==null) {
				var qs = getSteppingDecimal(context.assetSession.QuantityStepping);
			}
			else var qs = 2;
			if(context.assetSession.PriceStepping!==null) {
				var ps = getSteppingDecimal(context.assetSession.PriceStepping);
			}
			else var ps = 2;

			if(context.assetSession.DifferentialPriceAllowed) {
				//console.log('allow negative price');
				$("#order-Price").autoNumeric('update', {vMin:-9999999});
			}
			else {
				$("#order-Price").autoNumeric('update', {vMin:0});
			}

			if(typeof match != 'undefined' && match != null) {
				$("#order-Quantity").val(localeNumber(match.Quantity,qs));
				$("#order-Price").val(localeNumber(match.Price,ps));
				if(match.isPartial) {
					$("#partial").prop('checked',true);
					$("#total").prop('checked',false);
					if(context.assetSession && !context.assetSession.PartialFlagChangeAllowed) {
						$("#total").prop('disabled',true);
					}
				}
				else {
					$("#partial").prop('checked',false);
					$("#total").prop('checked',true);
					if(context.assetSession && !context.assetSession.PartialFlagChangeAllowed) {
						$("#total").prop('disabled',true);
					}
				}
			}
			else {
				$("#order-Quantity").val(localeNumber(item.Quantity,qs));
				$("#order-Price").val(localeNumber(item.Price,ps));
				if(item.isPartial) {
					$("#partial").prop('checked',true);
					$("#total").prop('checked',false);
					if(context.assetSession && !context.assetSession.PartialFlagChangeAllowed) {
						$("#total").prop('disabled',true);
					}
				}
				else {
					$("#partial").prop('checked',false);
					$("#total").prop('checked',true);
					if(context.assetSession && !context.assetSession.PartialFlagChangeAllowed) {
						$("#total").prop('disabled',true);
					}
				}
			}
			$("#order-ID_Ring").val(item.ID_Ring);
			$("#order-ID_Asset").val(item.ID_Asset);
			var date = new moment(item.ExpirationDate);
			$("#order-Date").val(date.format('DD MMM YYYY'));
			$("#order-Time").val(date.format('HH:mm:ss'));
			$("#order-Time").timepicker('setTime',date.format('HH:mm:ss'));

			if(context.brokerClients) {
				var client = context.brokerClients[searchItemInArray(item.ID_Client,context.brokerClients,'ID_Client')];
				if(client) {
					$("#order-ID_Client").append('<option value="'+item.ID_Client+'">'+client.Code+'</option>');
					$("#clientWarranties").html('<strong>'+client.AvailableWarranty+'</strong> Lei');
				}
				else $("#order-ID_Client").append('<option value="'+item.ID_Client+'">'+item.Client+'</option>');
			}
			else {
				$("#order-ID_Client").append('<option value="'+item.ID_Client+'">'+item.Client+'</option>');
			}
			$("#order-ID_Client").attr('readonly',true);
			$(".order-action-title").html(getTranslation('Change'));
			$("#order-submit").html(getTranslation('Change_it'));
			if(item.Direction=='B') {
				$(".order-direction-holder").html(getTranslation('buy'));
			}
			else {
				$(".order-direction-holder").html(getTranslation('sell'));
			}
			$(".order-asset-holder").html(' '+getTranslation('on_asset')+' '+getTranslation(asset.Name));
			$("#order-Quantity").parent().find('.input-placeholder').html(asset.MeasuringUnit);
			$("#new-asset-form").hide(0);
			$orderform.addClass('edit-form');
			//$("#orders-container").hide(0);
			$container.show(0);
			if(item.ID_Asset != context.asset_id) changeContext(item.ID_Ring,item.ID_Asset);
			if($("#main-menu-toggle-wrapper").is(":visible")) {
				$('html, body').animate({
					scrollTop: $("#order-form-container").offset().top
				}, 400);
			}
		}

		$(document).on('click','.cancel-order-button',function (e) {
			var ok = true;
			var $orderId = $(this).attr('data-value');
			var $url = $(this).attr('href');
			fancyConfirm(getTranslation('Order_cancel_confirm'),function(r){
				if(r) {
					$.post($url,{},function(data,textStatus){
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
							//deleteOrder($orderId);
							//console.log('order bye bye!');
							if(context.ring_id && context.asset_id) {
								//console.log('reset delta t!');
								//getAssetOrders();
							}
						}
					});
				}
			});
			e.preventDefault();
		});

		$('#order-form').submit(function(e){
			if(!formSubmitted) {
				//$("#order-form-container").addClass('loading');

				formSubmitted = true;
				var ok = true;
				var $form = $(this);
				$('#order-form').find(".error").remove();
				/*
				$('#order-form').find(".required").each(function(elm){
					if($.trim($(this).val())=='') {
						$('<span class="error">Campul este obligatoriu.</span>').insertAfter($(this).parent());
						ok = false;
					}
				});
				*/
				if($.trim($("#order-ID_Client").val())=='') {
					$('<span class="error">Campul este obligatoriu.</span>').insertAfter($("#order-ID_Client").parent());
					ok = false;
					formSubmitted = false;
					//$("#order-form-container").removeClass('loading');
				}
				if(ok) {



					$("#order-SubmitTime").val(time.format());
					$.post('/order/validate',$('#order-form').serialize(),function(data,textStatus){
						if(!data.Success) {
							log('validation errors');
							if(data.ResultType=='JSONKeyValuePairStruct') {
								for(var i in data.Result) {
									if(data.Result[i]!='') {
										$('<span class="error">'+data.Result[i]+'</span>').insertAfter($("input[name='"+i+"']").parent());
										ok = false;
										formSubmitted = false;
										//$("#order-form-container").removeClass('loading');
									}
								}
							}
							else {
								$('<div class="alert alert-error error"><button class="close" data-dismiss="alert"></button><p>'+data.Result+'</p></div>').insertAfter($("#new-asset-form"));
								ok = false;
								formSubmitted = false;
								//$("#order-form-container").removeClass('loading');
							}
						}
						if(ok) {


							if(!successShown) 
							{
							 successShown = true;
					 		 fancySuccess('Ordinul pentru '+$("#order-Quantity").val()+'@'+$("#order-Price").val()+' a fost trimis la ora: '+time.format(),function() {
								 successShown = false;
								 $.fancybox.close();
								 });
							}

							$container = $("#order-form-container");
							$orderform = $("#order-form");
							$container.hide(0);
							$("#orders-container").show(0);
							$('html, body').animate({
								scrollTop: $("#asset-orders-container").offset().top
							}, 200);

							$.post(($form.hasClass('edit-form')?'/order/edit/'+$("#order-ID").val():'/order/add'),$('#order-form').serialize(),function(data,textStatus){
								if(!data.Success) {
									if(data.ResultType=='JSONKeyValuePairStruct') {
										for(var i in data.Result) {
											if(data.Result[i]!='') {
												$('<span class="error">'+data.Result[i]+'</span>').insertAfter($("input[name='"+i+"']").parent());
												ok = false;
											}
										}
										$("#orders-container").hide(0);
										$container.show(0);
									}
									else if(data.ResultType=='GeneralError' || data.ResultType=='String') {
										fancyAlert(data.Result);
									}
								}
								else if(data.Success) {
									document.getElementById('order-form').reset();
									$orderform.removeClass('edit-form');
									//console.log('order saved');
									if(context.ring_id && context.asset_id) {
										//console.log('context opened, lets refres delta t');
										//getAssetOrders();
										onContextChanged();
										//processAssetOrder(data.Result);
										//$.event.trigger('assetOrdersLoaded');
									}
								}
								formSubmitted = false;
								//$("#order-form-container").removeClass('loading');
							});
						}
					});
				}
				else {
					formSubmitted = false;
					//$("#order-form-container").removeClass('loading');
				}
			}
			e.preventDefault();
		});

		$('#order-Date').datepicker({
			dateFormat:'dd M yyyy',
			startDate:startDate,
			endDate:endDate,
			autoclose:true,
			orientation:'auto top'
		});
		$('.timepicker-24').timepicker({
					minuteStep: 1,
					showSeconds: true,
					showMeridian: false,
					defaultTime: false
		});

    $(document).on('keypress',function (e) {
      var code = e.keyCode || e.which;
      if(code == 109) {
        if(context.asset_id && context.ring_id && context.assetSession && !$("#chat-input").is(":focus")) {
          var userOrders = [];
          var bestOrder = null;
          for(var i=0;i<context.assetOrders.length;i++) {
            if(context.assetOrders[i].ID_Broker==b_id || (context.assetOrders[i].ID_Agency==a_id && context.assetOrders[i].isInitial)) {
              userOrders.push(context.assetOrders[i]);
              if(!bestOrder) {
                bestOrder = context.assetOrders[i];
              }
              else if(context.assetOrders[i].Direction=='B' && context.assetOrders[i].Price>bestOrder.Price){
                bestOrder = context.assetOrders[i];
              }
              else if(context.assetOrders[i].Direction=='S' && context.assetOrders[i].Price<bestOrder.Price){
                bestOrder = context.assetOrders[i];
              }
            }
          }
          if(bestOrder) {
            editOrderForm(bestOrder);
            return;
          }
          else if(userOrders.length==1) {
            editOrderForm(userOrders[0]);
            return;
          }
        }
      }
    });
	}

	newSailsSocket.on('order', function(message) {
		processOrder(message.data.item);
	});
});


