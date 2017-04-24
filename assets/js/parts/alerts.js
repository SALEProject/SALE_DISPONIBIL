/****** data functions ***************/

var alerts = [];

function getAlerts(clear) {
	var start  = Date.now();
	console.log('requesting alerts..');
	newSailsSocket.get('/notification/alerts', {}, function(response) {
		if(response.Success) {
			if(clear) {
				alerts = [];
			}
			if(response.Result && Object.keys(response.Result).length>0) {
				var $alerts = $("#alerts-container");
				var items = [];
				//log(Object.keys(response.data));
				for(var i in (Object.keys(response.Result))) {
				//log(i);
					items.push(response.Result[Object.keys(response.Result)[i]]);
				}
				var item = items[items.length-1];
				//log(item);
				$("#main-alert").html('<p class="alert first-alert"><span class="col-md-3 col-xs-2 muted time-label">' + moment(item.Date).format("DD MMM HH:mm") + '</span> <span class="col-md-9 col-xs-10 alert-label">' + item.Message + '</span></p>');
				//if(items.length>1) {
					for (var i=items.length-1;i>=0 && items.length-i<12;i--) {
						appendAlert(items[i]);
					}
				//}
				//if($("#alert-"+item.ID).length==0) {
					//if(clear) $alerts.html('');
					//$alerts.append('<p class="alert" id="alert-' + item.ID + '"><span class="muted">' + moment(item.Date).format("DD MMM HH:mm") + '</span> ' + item.Message + '</p>');
					//$alerts.effect('pulsate','slow');
				//}
				console.log('get alerts: '+ (Date.now()-start));
			}
			$.event.trigger('alertsLoaded',clear);
		}
		else {
			parseResponse('getAlerts',response);
		}
	});
}

/****** view functions ***************/

function appendAlert(item) {
	if(searchIdInArray(item.ID,alerts)==-1) {
		alerts.push(item);
		$("#alerts-list").append('<li class="row" id="alert-' + item.ID + '"><span class="col-md-3 col-xs-2 muted time-label">' + moment(item.Date).format("DD MMM HH:mm") + '</span> <span class="col-md-9 col-xs-10 alert-label">' + item.Message + '<span></li>');
	}
}

/******* events **********/

$(document).on('socketConnected',function(e) {
	if($("#alerts-container").length>0) {
		newSailsSocket.on('connect', function() {
			getAlerts(true);
		});

		newSailsSocket.on('alert', function(message) {
			//$("#alerts-list").prepend('<li>'+$("#alerts-container .first-alert").html()+'</li>');
			$("#alerts-list").prepend('<li class="row" id="alert-' + message.data.item.ID + '"><span class="col-md-3 col-xs-2 muted time-label">' + moment(message.data.item.Date).format("DD MMM HH:mm") + '</span> <span class="col-md-9 col-xs-10 alert-label">' + message.data.item.Message + '<span></li>');
			$("#main-alert").html('<p class="alert first-alert"><span class="col-md-3 col-xs-2 muted time-label">' + moment(message.data.item.Date).format("DD MMM HH:mm") + '</span>  <span class="col-md-9 col-xs-10 alert-label">' + message.data.item.Message + '</span></p>');
			$("#alerts-container").effect('pulsate','slow');
		});
	}
});
