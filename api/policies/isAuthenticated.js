/**
 * isAuthenticated
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

	if (req.isSocket) {
		if(req.session.authenticated) {
			//console.log(sails.storage.userSessions);
			if(typeof sails.storage.userSessions[req.session.currentUser.ID] != 'undefined' && typeof sails.storage.userSessions[req.session.currentUser.ID].sid != 'undefined' && sails.storage.userSessions[req.session.currentUser.ID].sid == req.sessionID) {
				sails.storage.userSessions[req.session.currentUser.ID].lastUpdate = Date.now();
				sails.storage.userSessions[req.session.currentUser.ID].socket = req.socket.id;
				//UserLogin.publishDestroy(req.socket.handshake.session.currentUser.ID,req.socket);
				return next();
			}
			else {
				//console.log('user not in db!!!');
				//console.log(req.method+' '+req.protocol+' '+req.url);
				/*
				if(typeof req.sessionStore != 'undefined') {
					req.sessionStore.get(req.socket.sid, function (error, val) {
						if (error !== null) console.log("error: " + error);
						else {
							val.destroy();
						}
					});
				}
				*/
				//req.socket.disconnect();
				//req.socket.emit('logout');
				//req.socket.session.destroy();
				//req.session.destroy();
				return res.json({Success:false, ResultType:'LoginError', Result: 'S-a pierdut conexiunea cu serverul.'});
			}
		}
		else {
			console.log('handshake NOT ok');
			//console.log(req.socket.handshake);
			console.log(req.method+' '+req.protocol+' '+req.url);
			/*
			console.log(req.sessionID);
			console.log(req.session.authenticated);
			console.log(req.socket);
			console.log(req.socket.id);
			*/
			/*
			if(typeof req.sessionStore != 'undefined') {
				req.sessionStore.get(req.socket.sid, function (error, val) {
					if (error !== null) console.log("error: " + error);
					else {
						val.destroy();
					}
				});
			}
			*/
			//req.socket.emit('logout');
			//req.socket.session.destroy();
			//req.session.destroy();
			return res.json({Success:false, ResultType:'LoginError', Result: 'S-a pierdut conexiunea cu serverul.'});
		}
	}
	else if(req.session.authenticated) {
		/*
		if(req.session.currentUser.isAdministrator) {
			return next();
		}
		*/
		if(typeof sails.storage.userSessions[req.session.currentUser.ID] != 'undefined' && typeof sails.storage.userSessions[req.session.currentUser.ID].sid != 'undefined' && sails.storage.userSessions[req.session.currentUser.ID].sid == req.sessionID) {
			return next();
		}
		else if(typeof sails.storage.userSessions[req.session.currentUser.ID] == 'undefined') {
			req.flash('error',req.session.getTranslation('User_session_expired'));
		}
		else if(typeof sails.storage.userSessions[req.session.currentUser.ID].sid == 'undefined') {
			req.flash('error',req.session.getTranslation('User_session_not_found'));
		}
		else if(typeof sails.storage.userSessions[req.session.currentUser.ID].sid != req.sessionID) {
			req.flash('error',req.session.getTranslation('User_logged_in_with_different_session'));
		}
		console.log('problem!!!');
	}
	else {
		//console.log(req.session);
	}
	if(!req.isSocket) {
		return res.redirect('/logout');
	}
	else {
		//console.log(req.options.detectedVerb.path);
		return res.json({Success:false, ResultType:'LoginError', Result: 'S-a pierdut conexiunea cu serverul.'});
	}
};
