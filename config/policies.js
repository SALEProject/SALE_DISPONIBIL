/**
 * Policy mappings (ACL)
 *
 * Policies are simply Express middleware functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect just one of its actions.
 *
 * Any policy file (e.g. `authenticated.js`) can be dropped into the `/policies` folder,
 * at which point it can be accessed below by its filename, minus the extension, (e.g. `authenticated`)
 *
 * For more information on policies, check out:
 * http://sailsjs.org/#documentation
 */


var userPolicies = ['browserCheck', 'logger','locale','isAuthenticated'];
var adminPolicies = ['browserCheck', 'logger','locale','isAuthenticated','isAdministrator'];

module.exports.policies = {
	'*': userPolicies,

  BrowserController: {
    '*': ['logger', 'locale']
  },

	FileController: {
		'*': true
	},
	AccountController: {
		'*': userPolicies,
		login: ['browserCheck', 'logger','locale','transactions','userRoles','currencies','measuringUnits'],
		logout: true,
		recover: ['browserCheck', 'logger','locale','transactions'],
		agency_view: userPolicies.concat(['agencies', 'counties']),
		agency_edit: userPolicies.concat(['agencies', 'counties']),
		profile: userPolicies.concat(['agencies', 'counties']),
		edit_profile: userPolicies.concat(['agencies', 'counties']),
		agency_assets: userPolicies.concat(['rings']),
	},

	AdminController: {
		'*': adminPolicies,
		index: adminPolicies.concat(['userStates','userOperations'])
		//agency_edit: userPolicies.concat(['isAdministrator','agencies','userRoles','counties','rings','assetTypes','assets','users','measuringUnits','currencies','params','clients','agencyRings','agencyClients']),
		//client_edit: userPolicies.concat(['isAdministrator','agencies','userRoles','counties','rings','assetTypes','assets','users','measuringUnits','currencies','params','clients','clientWarranties']),
		//ring_edit: userPolicies.concat(['isAdministrator','agencies','userRoles','counties','rings','assetTypes','assets','users','measuringUnits','currencies','params','clients','ringAgencies','ringClients']),
		//wizard_4: userPolicies.concat(['isAdministrator','agencies','userRoles','counties','rings','assetTypes','assets','users','measuringUnits','currencies','params','clients','ringAgencies','ringClients','assetClients']),
		//wizard_5: userPolicies.concat(['isAdministrator','agencies','userRoles','counties','rings','assetTypes','assets','users','measuringUnits','currencies','params','clients','ringAgencies','ringClients','assetClients', 'assetDocuments'])
	},

	AgencyController: {
		'*': userPolicies,
		agencies: adminPolicies.concat(['agencies','counties']),
		agency_add: adminPolicies.concat(['agencies','counties','agencyClients','agencyRings']),
		agency_edit: adminPolicies.concat(['agencies','counties','agencyClients','agencyRings','agencyContacts','agencyBrokers']),
		agency_delete: adminPolicies
	},

	AssetController: {
		//'*': userPolicies.concat(['ringWarrantyTypes','assetWarrantyTypes']),
		'*': userPolicies,
		assets: adminPolicies.concat(['assetTypes','rings','measuringUnits','currencies']),
		asset_save: adminPolicies.concat(['assetTypes','rings','measuringUnits','currencies','terminals']),
		trade_parameters: adminPolicies.concat(['assetSingle','assetTypes','rings','measuringUnits','currencies','params','ringWarrantyTypes','assetWarrantyTypes']),
		parameters: userPolicies.concat(['params','assetSchedules']),
		save_parameters: userPolicies.concat(['params','assetSchedules']),
		asset_delete: adminPolicies
	},

	AssetScheduleController: {
		'*': userPolicies,
		asset_schedules: adminPolicies.concat(['assets']),
		schedules: adminPolicies.concat(['assetSingle','assetTypes','rings','params']),
		asset_schedule_add: adminPolicies.concat(['assets']),
		asset_schedule_edit: adminPolicies.concat(['assets']),
		asset_schedule_delete: adminPolicies
	},

	AssetTypeController: {
		'*': userPolicies,
		asset_types: adminPolicies.concat(['rings','currencies','measuringUnits']),
		asset_type_add: adminPolicies.concat(['rings','currencies','measuringUnits','params']),
		asset_type_edit: adminPolicies.concat(['rings','currencies','measuringUnits','params']),
		asset_type_delete: adminPolicies
	},

	CAENController: {
		caens: adminPolicies,
		caen_add: adminPolicies,
		caen_edit: adminPolicies,
		caen_delete: adminPolicies
	},

	ChatController: {
		'*': userPolicies
	},

	ClientController: {
		clients: adminPolicies.concat(['counties','agencies']),
		asset_clients: adminPolicies.concat(['assetSingle','counties','agencies','assetClients','clients','ringClients']),
		client_add: adminPolicies.concat(['counties','agencies']),
		client_edit: adminPolicies.concat(['counties','agencies', 'clientWarranties']),
		client_delete: adminPolicies
	},

	CountyController: {
		counties: adminPolicies,
		county_add: adminPolicies,
		county_edit: adminPolicies,
		county_delete: adminPolicies
	},

	ContactController: {
		contacts: adminPolicies,
		contact_add: adminPolicies.concat(['counties','agencies']),
		contact_edit: adminPolicies.concat(['counties','agencies']),
		contact_delete: adminPolicies.concat(['counties','agencies'])
	},

	CPVController: {
		cpvs: adminPolicies,
		cpv_add: adminPolicies,
		cpv_edit: adminPolicies,
		cpv_delete: adminPolicies
	},

	CurrencyController: {
		currencies: adminPolicies,
		currency_add: adminPolicies,
		currency_edit: adminPolicies,
		currency_delete: adminPolicies
	},

	DocumentController: {
		download: true,
		documents: adminPolicies.concat(['documentTypes']),
		asset_documents: adminPolicies.concat(['assetSingle','documentTypes','assetDocuments']),
		document_add: adminPolicies.concat(['assetSingle','documentTypes']),
		document_edit: adminPolicies.concat(['assetSingle','documentTypes']),
		document_delete: adminPolicies
	},

	DocumentTypeController: {
		document_types: adminPolicies,
		document_type_add: adminPolicies,
		document_type_edit: adminPolicies,
		document_type_delete: adminPolicies
	},

	HomeController: {
		'*': userPolicies,
		index: userPolicies.concat(['userStates','userOperations','activeRings','params'/*,'agencies','users'*/])
	},

  ContextController: {
    '*': userPolicies/*,
    change: userPolicies.concat(['userStates','userOperations','activeRings','params','agencies','users'])*/
  },

	MarketController: {
		'*': userPolicies.concat(['ringSession'])
	},

	MeasuringUnitController: {
		measuring_units: adminPolicies,
		measuring_unit_add: adminPolicies,
		measuring_unit_edit: adminPolicies,
		measuring_unit_delete: adminPolicies
	},

	NotificationController: {
		'*': userPolicies
	},

	OrderController: {
		'*': userPolicies,
		orders: adminPolicies.concat(['assets','rings','params','users']),
		initial_order: adminPolicies.concat(['orderAsset','rings','params','users','clientsShort','agencies','assetTypes']),
		order_add: adminPolicies.concat(['assets','rings','params','users']),
		order_edit: adminPolicies.concat(['assets','rings','params','users']),
		order_delete: adminPolicies
	},

	ReportController: {
		'*': userPolicies.concat(['reportTypes']),
		assets_index: adminPolicies.concat(['rings']),
		assets_clients: adminPolicies.concat(['assetReport','assetClients','rings','measuringUnits','currencies']),
		assets_orders: adminPolicies.concat(['assetReport','rings','measuringUnits','currencies']),
		assets_participants: adminPolicies.concat(['assetReport','rings','measuringUnits','currencies']),
		assets_transactions: adminPolicies.concat(['assetReport','rings','measuringUnits','currencies']),
		assets_warranties: adminPolicies.concat(['assetReport','rings','measuringUnits','currencies']),
		assets_documents: adminPolicies.concat(['assetReport','rings','measuringUnits','currencies']),
		assets_quotes: adminPolicies.concat(['assetReport','rings','measuringUnits','currencies']),
		assets_tradeparams: adminPolicies.concat(['assetReport','rings','measuringUnits','currencies']),
		assets_tradesession: adminPolicies.concat(['assetReport','rings','measuringUnits','currencies']),
		new_reports_index: adminPolicies.concat(['reportTypes','rings']),
		new_reports: adminPolicies.concat(['assetReport','reportTypes'])
	},

	RingController: {
		'*': userPolicies,
		rings: adminPolicies,
		ring_add: adminPolicies.concat(['clients','ringClients','assetTypes','measuringUnits','currencies','users','ringUsers','ringWarrantyTypes','warrantyTypes']),
		ring_edit: adminPolicies.concat(['clients','ringClients','assetTypes','measuringUnits','currencies','users','ringUsers','ringAssets','ringWarrantyTypes','warrantyTypes']),
		ring_delete: adminPolicies
	},

	TerminalController: {
		'*': userPolicies,
		terminals: adminPolicies.concat(['counties']),
		terminal_add: adminPolicies.concat(['counties']),
		terminal_edit: adminPolicies.concat(['counties']),
		terminal_delete: adminPolicies
	},

	TransactionController: {
		'*': userPolicies,
		transactions: adminPolicies,
		ttransaction_add: adminPolicies,
		terminal_edit: adminPolicies
	},

	UserController: {
		'*': userPolicies,
		'index': true,
		users: adminPolicies.concat(['agencies','userRoles']),
		user_add: adminPolicies.concat(['agencies','userRoles','counties']),
		user_edit: adminPolicies.concat(['agencies','userRoles','counties']),
		user_delete: adminPolicies
	},

	WarrantyController: {
		'*': userPolicies,
		warranties: adminPolicies.concat(['agencies','warrantyTypes','currencies']),
		warranty_add: adminPolicies.concat(['clientsShort','agencies','warrantyTypes','currencies']),
		warranty_edit: adminPolicies.concat(['clientsShort','agencies','warrantyTypes','currencies']),
		warranty_delete: adminPolicies
	},

	WarrantyTypeController: {
		'*': userPolicies,
		warranty_types: adminPolicies,
		warranty_type_add: adminPolicies,
		warranty_type_edit: adminPolicies,
		warranty_type_delete: adminPolicies
	}
};


/**
 * Here's what the `isNiceToAnimals` policy from above might look like:
 * (this file would be located at `policies/isNiceToAnimals.js`)
 *
 * We'll make some educated guesses about whether our system will
 * consider this user someone who is nice to animals.
 *
 * Besides protecting rabbits (while a noble cause, no doubt),
 * here are a few other example use cases for policies:
 *
 *	+ cookie-based authentication
 *	+ role-based access control
 *	+ limiting file uploads based on MB quotas
 *	+ OAuth
 *	+ BasicAuth
 *	+ or any other kind of authentication scheme you can imagine
 *
 */

/*
module.exports = function isNiceToAnimals (req, res, next) {

	// `req.session` contains a set of data specific to the user making this request.
	// It's kind of like our app's "memory" of the current user.

	// If our user has a history of animal cruelty, not only will we
	// prevent her from going even one step further (`return`),
	// we'll go ahead and redirect her to PETA (`res.redirect`).
	if ( req.session.user.hasHistoryOfAnimalCruelty ) {
		return res.redirect('http://PETA.org');
	}

	// If the user has been seen frowning at puppies, we have to assume that
	// they might end up being mean to them, so we'll
	if ( req.session.user.frownsAtPuppies ) {
		return res.redirect('http://www.dailypuppy.com/');
	}

	// Finally, if the user has a clean record, we'll call the `next()` function
	// to let them through to the next policy or our controller
	next();
};
*/
