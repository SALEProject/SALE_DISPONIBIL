/****** data functions ***************/

var notifications = [];

function getNotifications(clear) {
	newSailsSocket.get('/notification', {since:last_notification}, function(response) {
		if(response.Success) {
			log('notifications:');
			log(response.Result);
			if(response.Result && Object.keys(response.Result).length>0) {
				//var $notifications = $("#notification-list");
				var count = 0;
				for (var i=response.Result.length-1;i>=0;i--) {
					if(i>=response.Result.length-10) appendNotification(response.Result[i]);
					if(!response.Result[i].isRead) count++;
				}
				var last_notification = response.Result[0].Date;
				count += $("#my-task-list").attr('data-count')*1;
				$("#my-task-list").attr('data-count',count);
				$("#my-task-list .badge").html(count);
				if(count>0) $("#my-task-list .badge").addClass('badge-important');
			}
		}
		else {
			parseResponse('getNotifications',response);
		}
	});
}

/****** view functions ***************/

function appendNotification(item) {
	if(searchIdInArray(item.ID,notifications)==-1) {
		alerts.push(item);
		$("#notification-list .message-list").append('<li id="notification-' + item.ID + '" class="notification notification-' + item.ID + ' '+(item.isRead?'':'unread')+'"><div class="notification-timestamp">' + moment(item.Date).format("DD MMM HH:mm") + '</div> <div class="notification-from">' + (item.UserFrom?item.UserFrom:'Sistem') + '</div><div class="notification-subject">' + item.Subject + '</div><a class="notification-action" href="/home/readnotification/'+item.ID+'" data-id="'+item.ID+'"><i class="fa"></a></li>');
	}
}

function updateMessageCount() {
	var count = $("#my-task-list").attr('data-count');
	$("#my-task-list .username .badge").html(count);
	if(count==0) $("#my-task-list .username .badge").removeClass('badge-important');
	else $("#my-task-list .username .badge").addClass('badge-important');
}

/******* events **********/

$(document).on('transactionsLoaded',function(e,clear) {
	updateTransactions(clear);
});

$(document).on('socketConnected',function(e) {
	if($("#notification-list").length>0) {
		getNotifications(true);
		$('body').on('click',".notification-action",function(e) {
			e.preventDefault();
			var ID = $(this).attr('data-id');
			$li = $(this).closest('.notification');
			var count = $("#my-task-list").attr('data-count')*1;
			if($li.hasClass('unread')) {
				$.post($(this).attr('href'),{},function(response) {
					if(response.success) {
						$('.notification-'+ID).removeClass('unread');
						$("#my-task-list").attr('data-count',(count-1));
						updateMessageCount();
					}
					else {
						fancyAlert(response.error);
					}
				});
			}
			else {
				//$li.addClass('unread');
				//$("#my-task-list").attr('data-count',(count+1));
				//updateMessageCount();
			}
		});

		newSailsSocket.on('notification', function(message) {
			getNotifications();
		});
	}
});


