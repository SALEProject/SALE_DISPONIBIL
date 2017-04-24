/**
 * locale
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
	//res.setLocale(req.param('lang') || sails.config.i18n.defaultLocale);
	if(typeof req.session.authenticated != 'undefined' && req.session.authenticated) {
		res.setLocale(req.session.lang.code.toLowerCase());
	}
	else {
		res.setLocale('ro');
		req.session.lang = sails.languages['ro'];
	}
	req.session.getTranslation = function(label) {
		return toolsService.getTranslation(label,req);
	};
	req.session.getSysTranslation = function(label) {
		return toolsService.getSysTranslation(label,req);
	};
	req.session.getFieldTranslation = function(item,field) {
		return toolsService.getFieldTranslation(item,field,req);
	};
	req.session.formatLocale = function(number,prec) {
		return formatService.formatLocale(number,req.session.lang,(typeof prec != 'undefined' ? prec : 0));
	};
	return next();
}
