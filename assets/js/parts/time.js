/****** data functions ***************/

var time = null;
var initial_time = null;
var time_diff = null;
var time_interval = null;

function getServerTime() {
	newSailsSocket.get('/home/time', {}, function(response) {
		if(response.Success) {
			time = new moment(response.Result);
			initial_time = time.clone();
			time_diff = Date.now();
			if(time_interval) clearInterval(time_interval);
			time_interval = setInterval(function(){
				var diff = Math.round(( Date.now()-time_diff)/1000);
				var new_time = initial_time.clone();
				time = new_time.add(diff,'seconds');
				updateServerTime();
			},250);
			$.event.trigger('serverTimeUpdated');
		}
		else {
			parseResponse('getServerTime',response);
		}
	});
}


/****** view functions ***************/

function updateServerTime() {
	$(".server-time").html(time.format('HH:mm:ss'));
	if(typeof updateAssetSessionTime == 'function') {
		updateAssetSessionTime();
	}
	if(typeof updateAssetSessionDeltas == 'function') {
		updateAssetSessionDeltas();
	}
}


/******* events **********/

$(document).on('wakeUp',function(e,clear) {
	getServerTime();
});

$(document).on('socketConnected',function(e) {
	var $container = $("#time-container");
	if($container.length>0) {
		getServerTime();
	}
});


