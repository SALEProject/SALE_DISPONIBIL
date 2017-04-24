/****** data functions ***************/

var transactions = [];

function getTransactions(clear) {
	newSailsSocket.get('/transaction', {}, function(response) {
		if(response.Success) {
			if(clear) {
				transactions = [];
			}
			if(response.Result && response.Result.length>0) {
				for (var i=0;i<response.Result.length;i++) {
					processTransaction(response.Result[i]);
				}
			}
			$.event.trigger('transactionsLoaded',clear);
		}
		else {
			parseResponse('getTransactions',response);
		}
	});
}

function processTransaction(item) {
	var idx = searchIdInArray(item.ID,transactions);
	if(idx == -1) {
		transactions.push(item);
	}
	else if(objectChanged(item,transactions[idx])) {
		transactions[idx] = item;
	}
	$.event.trigger({type:'transactionProcessed',ID_Transaction:item.ID});
}


/****** view functions ***************/

var transactions_processing = false;
function updateTransactions(clear) {
	if(!transactions_processing) transactions_processing = true;
	var $container = $("#transactions-container");
	var $list = $("#transaction-list");
	$container.find(".loader").hide();
	$container.find(".empty-message").remove();
	if(clear) {
		$list.find('tbody').html('');
	}
	if(transactions.length>0) {
		$("#transaction-list").show();
		for (var i=0;i<transactions.length;i++) {
			updateTransaction(transactions[i].ID);
		}
	}
	else {
		$("#transaction-list").hide();
		$("#transaction-list").parent().append('<div class="text-center empty-message">'+getTranslation('No_transaction_available')+'</div>');
	}
	transactions_processing = false;
}

function updateTransaction(id) {
	var $list = $("#transaction-list");
	var $item = $("#transaction-"+id);
	var item = getArrayItem(transactions,id);
	if(item) {
		var html = $list.data('prototype');
		if(typeof html == 'undefined') {
			log('transaction list has no prototype');
		}
		else {
			html = getPrototypeData(item,html);
			var d = new moment(item.TransactionDate);
			html = html.replace('__TIME__',d.format('HH:mm'));
			html = html.replace('__DIRECTION_LABEL__',(item.Direction=='S'?'sell':'buy'));
			html = html.replace('__DIRECTION_STRING__',(item.Direction=='S'?'V':'C'));
			html = html.replace('__QUANTITY_NO__',localeNumber(item.Quantity,0));
			html = html.replace('__PRICE_NO__',localeNumber(item.Price,2));
			if($item.length>0) {
				$item.replaceWith(html);
			}
			else {
				$list.find("tbody").append(html);
			}
			$.event.trigger({type:'transactionUpdated',ID_Transaction:item.ID});
		}
	}
	else {
		log('transaction #'+id+' not found');
	}
}

/******* events **********/

$(document).on('transactionsLoaded',function(e,clear) {
	updateTransactions(clear);
});

$(document).on('socketConnected',function(e) {
	var $container = $("#transactions-container");
	if($container.length>0) {
		$container.find(".loader").show();
		getTransactions(true);

		$.tablesorter.addParser({
			id: 'price',
			is: function(s) {
				return false;
			},
			format: function(s) {
				return s.replace(' Lei','');
			},
			type: 'numeric'
		});
		$.tablesorter.addParser({
			id: 'quantity',
			is: function(s) {
				return false;
			},
			format: function(s) {
				return s.replace(' MWh','');
			},
			type: 'numeric'
		});

		$("#transaction-list").tablesorter({
			cssHeader: 'header-column',
			headers: {
				0: {
				},
				1: {
				},
				2: {
					sorter:'quantity'
				},
				3: {
					sorter:'price'
				},
				4: {
					sorter:false
				}
			}
		});

		newSailsSocket.on('transaction', function(message) {
			getTransactions();
		});
	}
});


