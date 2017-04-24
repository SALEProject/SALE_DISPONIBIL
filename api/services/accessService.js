exports.checkState = function(currentState,state,req) {
	if(typeof req.session.allowed_states != 'undefined' && req.session.allowed_states.indexOf(state)>-1) return true;
	else return false;
};
exports.checkOperation = function(currentState,operation,req) {
	if(typeof req.session.allowed_operations != 'undefined' && Object.keys(req.session.allowed_operations).indexOf(currentState)>-1) {
		if(req.session.allowed_operations[currentState].indexOf(operation)>-1) return true;
		else return false;
	}
	else if(req.session.allowed_states.indexOf(currentState)>-1) return true;
	else return false;
};
exports.isCurrentRoute = function(controller,action,req) {
	if(req.options.controller == controller && req.options.action == action) {
		return true;
	}
	return false;
};
exports.isRingAdministrator = function(user) {
	if(user.UserRole && user.UserRole.indexOf('Administrator Ring')>-1) {
		return true;
	}
	else {
		return false;
	}
};
exports.isSessionCoordonator = function(user) {
	if(user.UserRole && user.UserRole.indexOf('Coordonator Sedinta')>-1) {
		return true;
	}
	else {
		return false;
	}
};
exports.isSupervisor = function(user) {
	if(user.UserRole && user.UserRole.indexOf('Supervizor')>-1) {
		return true;
	}
	else {
		return false;
	}
};
