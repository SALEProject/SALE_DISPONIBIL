/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {

	sails.util.fs = require('fs');

	// open logs
	logService.openLogs(function(){
		logService.debug('Starting application...');
	});
	sails.storage = {};
	sails.timers = {};
	sails.processes = {};
	sails.storage.userSessions = {};
	sails.marketId = sails.config.marketId;
	sails.languages = {
		ro: {
			code: 'RO',
			dateFormat: 'dd MMM',
			decimalSeparator: ',',
			thousandSeparator: '.'
		},
		en: {
			code: 'EN',
			dateFormat: 'dd MMM',
			decimalSeparator: '.',
			thousandSeparator: ','
		}
	};

	// start app session
	storageService.getAppSession();
	eventService.startUsersTimer();

	if(sails.config.ssl.key) {
		var http = require('http');

		var server = http.createServer(function(req, res) {
			res.writeHead(301,{Location: 'https://'+req.headers.host+req.url});
			res.end();
		});
		server.listen(sails.config.redirectPort);
	}


	// It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  cb();
};
