/****** data functions ***************/

var chat = [];
var chatTriggers = [];
function getChatMessages(clear) {
	chatTriggers = [];
	var start = Date.now();
	console.log('requesting chat..');
	newSailsSocket.get('/chat', {since:$("#chat-list").attr('data-timestamp')}, function(response) {
		if(response.Success) {
			if(clear) {
				chat = [];
			}
			if(response.Result && response.Result.length>0) {
				for (var i=0;i<response.Result.length;i++) {
					processChatMessage(response.Result[i]);
				}
			}
			console.log('get chat: '+ (Date.now()-start));
			$.event.trigger('chatLoaded',clear);
		}
		else {
			parseResponse('getChatMesssages',response);
		}
	});
}

function processChatMessage(item) {
	var idx = searchIdInArray(item.ID,chat);
	if(idx == -1) {
		chat.push(item);
		chatTriggers.push({ID:item.ID,event:'chatMessageProcessedNew'});
		//$.event.trigger({type:'chatMessageProcessedNew',ID_Message:item.ID});
	}
	else if(objectChanged(item,chat[idx])) {
		chat[idx] = item;
		chatTriggers.push({ID:item.ID,event:'chatMessageProcessedExisiting'});
		//$.event.trigger({type:'chatMessageProcessedExisting',ID_Message:item.ID});
	}
	//$.event.trigger({type:'chatMessageProcessed',ID_Message:item.ID});
}


/****** view functions ***************/

function updateChatMessages(clear) {
	var $container = $("#chat-container");
	var $list = $("#chat-list");
	$container.find(".loader").hide();
	if(clear) {
		$list.html('');
	}
	for (var i=0;i<chatTriggers.length;i++) {
		$.event.trigger({type:'chatMessageProcessedNew',ID_Message:chatTriggers[i].ID,clear:clear});
		//updateChatMessage(chat[i].ID);
	}
	$container.find(".scroller").slimScroll({ scrollTo: $list.outerHeight(true)+'px' });
}

function updateChatMessage(id,clear) {
	var $list = $("#chat-list");
	var $item = $("#chat-item-"+id);
	var item = getArrayItem(chat,id);
	if(item) {
		$list.attr('data-timestamp',item.Date);
		//$list.append('<li class="chat-message" id="chat-item-' + item.ID + '"><div class="timestamp">' + item.Date.substr(11,5) + '</div><div class="message"><span class="message-owner">' + item.LoginName + ':</span> ' + item.Message + '</div></li>');

		var html = $list.data('prototype');
		if(typeof html == 'undefined') {
			log('chat list has no prototype');
		}
		else {
			html = getPrototypeData(item,html);
			html = html.replace('__TIMESTAMP__',item.Date.substr(11,5));
			if($item.length>0) {
				$item.replaceWith(html);
			}
			else {
				$list.append(html);
				//if(!clear && !$('#chat-input').is(':focus')) {
				if(!clear) {
					$("#chat-container").effect('highlight',1500);
				}
			}
			$.event.trigger({type:'chatMessageUpdated',ID_Message:item.ID});
		}
	}
	else {
		log('chat message #'+id+' not found');
	}
}

/******* events **********/

$(document).on('chatLoaded',function(e,clear) {
	updateChatMessages(clear);
});

$(document).on('chatMessageProcessedNew',function(e) {
	updateChatMessage(e.ID_Message,e.clear);
});

$(document).on('socketConnected',function(e) {
	$container = $("#chat-container");
	if($container.length>0) {
		$container.find(".loader").show();
		getChatMessages(true);
		
		var $input = $('#chat-input');

		$input.keypress(function (e) {
			if (e.keyCode === 13) {
				var chatToSend = $input.val();
				if($.trim($input.val())!='') {
					newSailsSocket.post('/chat/post', {
						message: chatToSend
					}, function(response) {
						$(e.currentTarget).val('');
					});
				}
			}
		});
		
		var $container = $("#chat-container");
		var diff = {top:0, left:0};
		
		$('body').on('mousedown', '.flyout h3', function(e) {
			var position = $container.offset();
			diff.top = e.pageY - position.top;
			diff.left = e.pageX - position.left;
			$container.addClass('draggable').parents().on('mousemove', function(e) {
				$('.draggable').css({
					top: e.pageY - diff.top - $(window).scrollTop(),
					left: e.pageX - diff.left,
					bottom: 'auto',
					right: 'auto'
				}).on('mouseup', function() {
					$container.removeClass('draggable');
				});
			});
			e.preventDefault();
		}).on('mouseup', function() {
			$('.draggable').removeClass('draggable');
		});

		newSailsSocket.on('chat', function (message) {
			console.log(message);
			getChatMessages();
		});
	}
});


