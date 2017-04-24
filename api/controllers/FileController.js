module.exports = {

	get: function (req, res) {
		var fs = require('fs');
		if (fs.existsSync(sails.config.appPath+'/.tmp/'+req.path.substr(1))) {
			res.sendfile(sails.config.appPath+'/.tmp/'+req.path.substr(1));
		}
		else {
			res.send(500,'File not found!');
		}
	},

	_config: {
		rest: false,
		shortcuts: false
	}
};