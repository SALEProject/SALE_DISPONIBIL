var sailsBRM = require('sails-brm');

sailsBRM.registerConnection(sails.config.brm);

module.exports = {
    select: function(collectionName, options, cb) {
		return sailsBRM.post(collectionName, options, cb);
	}
}