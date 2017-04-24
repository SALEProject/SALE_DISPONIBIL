exports.getSessionID = function(req) {
			return req.sessionID;
	if(req.isSocket) {
		if(typeof req.socket.handshake != 'undefined') {
			return req.socket.handshake.sessionID;
		}
		else {
			return null;
		}
	}
	else return req.sessionID;
};
exports.getSession = function(req) {
	return req.session;
	if(req.isSocket) req.socket.handshake.session;
	else return req.session;
};
