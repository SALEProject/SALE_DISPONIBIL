/****** data functions ***************/

var journal = [];
var journal_filters = {};

function getJournal(clear) {
	$("#example-table_wrapper").append('<div class="loader-overlayer"></div>');
	newSailsSocket.get('/home/journal', {}, function(response) {
		if(response.Success) {
			if(response.Result && response.Result.length>0) {
				for (var i=0;i<response.Result.length;i++) {
					appendJournal(response.Result[i]);
				}
				if(table_api.length>0) {
					table_api.fnDraw();
					$("#example-table_wrapper .loader-overlayer").remove();
				}
			}
		}
		else {
			parseResponse('getJournal',response);
		}
	});
}


/****** view functions ***************/

function appendJournal(item) {
	if(searchIdInArray(item.ID,journal)==-1) {
		journal.push(item);
		var date = new moment(item.Date);
		if(table_api.length>0) table_api.fnAddData([date.format('DD MMM YYYY HH:mm:ss.SSS'), item.Operation, item.LoginName, item.AgencyName, (item.ID_Order?'#'+item.ID_Order:''), (item.ClientName?item.ClientName:''), (item.AssetCode?item.AssetCode:''), (item.Quantity?$.number(item.Quantity,3,',','.'):''), (item.Price?$.number(item.Price,2,',','.'):''), (item.Message?item.Message:'')],false);
	}
}

/******* events **********/

$(document).on('socketConnected',function(e) {
	var $container = $("#journal-container");
	if($container.length>0) {

		getJournal(true);

		$('body').on('click',"#filter-journal",function(e) {
			e.preventDefault();
			journal_filters.user = $("#journal-ID_User").val();;
			journal_filters.agency = $("#journal-ID_Agency").val();;
			journal_filters.startdate = $("#journal-startDate").val();;
			if(table_api.length>0) {
				journal = [];
				table_api.fnClearTable();
				$("#example-table_wrapper").append('<div class="loader-overlayer"></div>');
				newSailsSocket.get('/home/journal', journal_filters, function(response) {
					if(response.Success) {
						if(response.Result && response.Result.length>0) {
							for (var i=0;i<response.Result.length;i++) {
								appendJournal(response.Result[i]);
							}
							if(table_api.length>0) {
								table_api.fnDraw();
								$("#example-table_wrapper .loader-overlayer").remove();
							}
						}
					}
					else {
						log('error loading journal ('+response.Result+')');
					}
				});
			}
		});

    $('.js-users-autocomplete').autocomplete({
      source: function (request, callback) {
        newSailsSocket.get('/home/users', {term: request.term}, function(response) {
          return callback(response);
        });
      },
      select: function (event, ui) {
        $('.js-users-autocomplete').val(ui.item.label);
        $('#journal-ID_User').val(ui.item.id);
      }
    });

    $('.js-agencies-autocomplete').autocomplete({
      source: function (request, callback) {
        newSailsSocket.get('/home/agencies', {term: request.term}, function(response) {
          return callback(response);
        });
      },
      select: function (event, ui) {
        $('.js-agencies-autocomplete').val(ui.item.label);
        $('#journal-ID_Agency').val(ui.item.id);
      }
    });

    $(document).on('keypress change', '.js-users-autocomplete', function () {
      if ($(this).val() == '') {
        $('#journal-ID_User').val('');
      }
    });

    $(document).on('keypress change', '.js-agencies-autocomplete', function () {
      if ($(this).val() == '') {
        $('#journal-ID_Agency').val('');
      }
    });

		newSailsSocket.on('journal', function(message) {
			appendJournal(message.data.item);
			if(table_api.length>0) table_api.fnDraw();
		});
	}
});


