module.exports = {
    
   index: function (req, res) {
		if(typeof sails.storage.chat != 'undefined' && typeof sails.storage.chat.Items != 'undefined') var items = sails.storage.chat.Items;
		else var items = [];
		return res.json({Success:true, ResultType:'Array', Result:items});
	},
  
	post: function(req,res) {
		restService.select(
			'Chat',
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"service":'/BRMWrite.svc',
				"procedure":'addChatMessage',
				"objects":
				[
					{
						"Arguments":
						{
							"Message": req.param('message')
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						if(typeof err == 'string') return res.json({Success:false, ResultType:'GeneralError', Result: err});
						else return res.json(err);
					},
					function(result){
						if(result>0) return res.json({Success:true,result:result});
						return res.json({Success:flase, ResultType:'GeneralError', Result: result});
					}
				);
			}
		);
	}
};
