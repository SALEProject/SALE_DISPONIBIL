/**
 * Routes
 *
 * Sails uses a number of different strategies to route requests.
 * Here they are top-to-bottom, in order of precedence.
 *
 * For more information on routes, check out:
 * http://sailsjs.org/#documentation
 */



/**
 * (1) Core middleware
 *
 * Middleware included with `app.use` is run first, before the router
 */


/**
 * (2) Static routes
 *
 * This object routes static URLs to handler functions--
 * In most cases, these functions are actions inside of your controllers.
 * For convenience, you can also connect routes directly to views or external URLs.
 *
 */

module.exports.routes = {

	// Home
	'/': {
		controller: 'HomeController',
		action: 'index'
	},

  '/context/change': {
    controller: 'ContextController',
    action: 'change'
  },

	'/reports': {
		controller: 'ReportController',
		action: 'index'
	},

	'/reports/orders': {
		controller: 'ReportController',
		action: 'orders'
	},

	'/reports/transactions': {
		controller: 'ReportController',
		action: 'transactions'
	},

	'/reports/events': {
		controller: 'ReportController',
		action: 'events'
	},

	'/transactions': {
		controller: 'TransactionController',
		action: 'index'
	},

	'/dictionary.js': {
		controller: 'TranslationController',
		action: 'js'
	},

	// Account
	'/login': {
		controller: "AccountController",
		action: 'login'
	},
	'/logout': {
		controller: "AccountController",
		action: 'logout'
	},
	'/recover': {
		controller: "AccountController",
		action: 'recover'
	},
	'/account/profile': {
		controller: "AccountController",
		action: 'profile'
	},
	'/account/edit_profile': {
		controller: "AccountController",
		action: 'edit_profile'
	},
	'/account/change_password': {
		controller: "AccountController",
		action: 'change_password'
	},
	'/account/agency_view': {
		controller: "AccountController",
		action: 'agency_view'
	},
	'/account/agency_edit': {
		controller: "AccountController",
		action: 'agency_edit'
	},
	'/account/agency_users': {
		controller: "AccountController",
		action: 'agency_users'
	},
	'/account/agency_clients': {
		controller: "AccountController",
		action: 'agency_clients'
	},
	'/account/agency_assets': {
		controller: "AccountController",
		action: 'agency_assets'
	},
	'/account/agency_assets/:id': {
		controller: "AccountController",
		action: 'agency_asset_view'
	},
	'/account/market_assets': {
		controller: "AccountController",
		action: 'market_assets'
	},
	/*
	'/account/market_assets/:id': {
		controller: "AccountController",
		action: 'market_asset_view'
	},
	*/
	'/account/today_assets': {
		controller: "AccountController",
		action: 'today_assets'
	},
	'/account/current_assets': {
		controller: "AccountController",
		action: 'current_assets'
	},
	'/account/agency_warranties': {
		controller: "AccountController",
		action: 'agency_warranties'
	},

	// Admin
	'/admin': {
		controller: "AdminController",
		action: 'index'
	},

	'/admin/users': {
		controller: "UserController",
		action: 'users'
	},
	'/admin/users/add': {
		controller: "UserController",
		action: 'user_add'
	},
	'/admin/users/edit/:id': {
		controller: "UserController",
		action: 'user_edit'
	},
	'/admin/users/delete/:id': {
		controller: "UserController",
		action: 'user_delete'
	},
	'/admin/users/enable/:id': {
		controller: "UserController",
		action: 'user_enable'
	},
	'/admin/users/disable/:id': {
		controller: "UserController",
		action: 'user_disable'
	},

	'/admin/agencies': {
		controller: "AgencyController",
		action: 'agencies'
	},
	'/admin/agencies/add': {
		controller: "AgencyController",
		action: 'agency_add'
	},
	'/admin/agencies/edit/:id': {
		controller: "AgencyController",
		action: 'agency_edit'
	},
	'/admin/agencies/delete/:id': {
		controller: "AgencyController",
		action: 'agency_delete'
	},
	'/admin/agencies/setAgency2Ring': {
		controller: "AgencyController",
		action: 'setAgency2Ring'
	},
	'/admin/agencies/setClient2Agency': {
		controller: "AgencyController",
		action: 'setClient2Agency'
	},

	'/admin/clients': {
		controller: "ClientController",
		action: 'clients'
	},
	'/admin/clients/add': {
		controller: "ClientController",
		action: 'client_add'
	},
	'/admin/clients/edit/:id': {
		controller: "ClientController",
		action: 'client_edit'
	},
	'/admin/clients/asset_clients': {
		controller: "ClientController",
		action: 'asset_clients'
	},
	'/admin/clients/delete/:id': {
		controller: "ClientController",
		action: 'client_delete'
	},

	'/admin/asset_schedules': {
		controller: "AssetScheduleController",
		action: 'asset_schedules'
	},
	'/admin/asset_schedules/add': {
		controller: "AssetScheduleController",
		action: 'asset_schedule_add'
	},
	'/admin/asset_schedules/edit/:id': {
		controller: "AssetScheduleController",
		action: 'asset_schedule_edit'
	},
	'/admin/asset_schedules/schedules': {
		controller: "AssetScheduleController",
		action: 'schedules'
	},
	'/admin/asset_schedules/json': {
		controller: "AssetScheduleController",
		action: 'json'
	},
	'/admin/asset_schedules/delete/:id': {
		controller: "AssetScheduleController",
		action: 'asset_schedule_delete'
	},
	//alex
	'/admin/asset_schedules/all_assetsschedules_json': {
		controller: "AssetScheduleController",
		action: 'all_assetsschedules_json'
	},

	'/admin/asset_types': {
		controller: "AssetTypeController",
		action: 'asset_types'
	},
	'/admin/asset_types/add': {
		controller: "AssetTypeController",
		action: 'asset_type_add'
	},
	'/admin/asset_types/edit/:id': {
		controller: "AssetTypeController",
		action: 'asset_type_edit'
	},
	'/admin/asset_types/delete/:id': {
		controller: "AssetTypeController",
		action: 'asset_type_delete'
	},

	'/admin/assets': {
		controller: "AssetController",
		action: 'assets'
	},
	'/admin/search_assets': {
		controller: "AssetController",
		action: 'search_assets'
	},
	'/admin/assets/add': {
		controller: "AssetController",
		action: 'asset_save'
	},
	'/admin/assets/edit/:id': {
		controller: "AssetController",
		action: 'asset_save'
	},
	'/admin/assets/delete/:id': {
		controller: "AssetController",
		action: 'asset_delete'
	},

	'/admin/assets/trade_parameters': {
		controller: "AssetController",
		action: 'trade_parameters'
	},
	//alex
	'/admin/assets/duplicate/:id': {
		controller: "AssetController",
		action: 'duplicate'
	},
	'/admin/assets/assets_json': {
		controller: "AssetController",
		action: 'assets_json'
	},
	'/admin/assets/setWarrantyType2Asset': {
		controller: "AssetController",
		action: 'setWarrantyType2Asset'
	},
	'/admin/assets/setWarrantyType2AssetPriority': {
		controller: "AssetController",
		action: 'setWarrantyType2AssetPriority'
	},
	//---------------

	'/admin/rings': {
		controller: "RingController",
		action: 'rings'
	},
	'/admin/rings/add': {
		controller: "RingController",
		action: 'ring_add'
	},
	'/admin/rings/edit/:id': {
		controller: "RingController",
		action: 'ring_edit'
	},
	'/admin/rings/delete/:id': {
		controller: "RingController",
		action: 'ring_delete'
	},
	'/admin/rings/setClient2Ring': {
		controller: "RingController",
		action: 'setClient2Ring'
	},
	'/admin/rings/setClient2Asset': {
		controller: "RingController",
		action: 'setClient2Asset'
	},

	'/admin/rings/setWarrantyType2Ring': {
		controller: "RingController",
		action: 'setWarrantyType2Ring'
	},
	'/admin/rings/setWarrantyType2RingPriority': {
		controller: "RingController",
		action: 'setWarrantyType2RingPriority'
	},
	'/admin/rings/setRingAdministrator': {
		controller: "RingController",
		action: 'setRingAdministrator'
	},
	//alex
	'/admin/rings/asset_clients_json': {
		controller: "RingController",
		action: 'asset_clients_json'
	},

	'/admin/orders': {
		controller: "OrderController",
		action: 'orders'
	},
	'/admin/orders/add': {
		controller: "OrderController",
		action: 'order_add'
	},
	'/admin/orders/edit/:id': {
		controller: "OrderController",
		action: 'order_edit'
	},
	'/admin/orders/initial': {
		controller: "OrderController",
		action: 'initial_order'
	},
	'/admin/orders/delete/:id': {
		controller: "OrderController",
		action: 'order_delete'
	},

	'/admin/currencies': {
		controller: "CurrencyController",
		action: 'currencies'
	},
	'/admin/currencies/add': {
		controller: "CurrencyController",
		action: 'currency_add'
	},
	'/admin/currencies/edit/:id': {
		controller: "CurrencyController",
		action: 'currency_edit'
	},
	'/admin/currencies/delete/:id': {
		controller: "CurrencyController",
		action: 'currency_delete'
	},

	'/admin/measuring_units': {
		controller: "MeasuringUnitController",
		action: 'measuring_units'
	},
	'/admin/measuring_units/add': {
		controller: "MeasuringUnitController",
		action: 'measuring_unit_add'
	},
	'/admin/measuring_units/edit/:id': {
		controller: "MeasuringUnitController",
		action: 'measuring_unit_edit'
	},
	'/admin/measuring_units/delete/:id': {
		controller: "MeasuringUnitController",
		action: 'measuring_unit_delete'
	},

	'/admin/document_types': {
		controller: "DocumentTypeController",
		action: 'document_types'
	},
	'/admin/document_types/add': {
		controller: "DocumentTypeController",
		action: 'document_type_add'
	},
	'/admin/document_types/edit/:id': {
		controller: "DocumentTypeController",
		action: 'document_type_edit'
	},
	'/admin/document_types/delete/:id': {
		controller: "DocumentTypeController",
		action: 'document_type_delete'
	},

	'/admin/documents': {
		controller: "DocumentController",
		action: 'documents'
	},
	'/admin/documents/add': {
		controller: "DocumentController",
		action: 'document_add'
	},
	'/admin/documents/edit/:id': {
		controller: "DocumentController",
		action: 'document_edit'
	},
	'/admin/documents/asset_documents': {
		controller: "DocumentController",
		action: 'asset_documents'
	},
	'/admin/documents/delete/:id': {
		controller: "DocumentController",
		action: 'document_delete'
	},

	'/admin/warranty_types': {
		controller: "WarrantyTypeController",
		action: 'warranty_types'
	},
	'/admin/warranty_types/add': {
		controller: "WarrantyTypeController",
		action: 'warranty_type_add'
	},
	'/admin/warranty_types/edit/:id': {
		controller: "WarrantyTypeController",
		action: 'warranty_type_edit'
	},
	'/admin/warranty_types/delete/:id': {
		controller: "WarrantyTypeController",
		action: 'warranty_type_delete'
	},

	'/admin/warranties': {
		controller: "WarrantyController",
		action: 'warranties'
	},
	'/admin/warranties/add': {
		controller: "WarrantyController",
		action: 'warranty_add'
	},
	'/admin/warranties/edit/:id': {
		controller: "WarrantyController",
		action: 'warranty_edit'
	},
	'/admin/warranties/delete/:id': {
		controller: "WarrantyController",
		action: 'warranty_delete'
	},
	//20150715
	'/admin/warranties/buffer': {
		controller: "WarrantyController",
		action: 'warranties_buffer'
	},
	'/admin/warranties/buffer/edit/:id': {
		controller: "WarrantyController",
		action: 'warranties_buffer_edit'
	},
	//--------

	'/admin/cpvs': {
		controller: "CPVController",
		action: 'cpvs'
	},
	'/admin/cpvs/add': {
		controller: "CPVController",
		action: 'cpv_add'
	},
	'/admin/cpvs/edit/:id': {
		controller: "CPVController",
		action: 'cpv_edit'
	},
	'/admin/cpvs/delete/:id': {
		controller: "CPVController",
		action: 'cpv_delete'
	},

	'/admin/caens': {
		controller: "CAENController",
		action: 'caens'
	},
	'/admin/caens/add': {
		controller: "CAENController",
		action: 'caen_add'
	},
	'/admin/caens/edit/:id': {
		controller: "CAENController",
		action: 'caen_edit'
	},
	'/admin/caens/delete/:id': {
		controller: "CAENController",
		action: 'caen_delete'
	},

	'/admin/terminals': {
		controller: "TerminalController",
		action: 'terminals'
	},
	'/admin/terminals/add': {
		controller: "TerminalController",
		action: 'terminal_add'
	},
	'/admin/terminals/edit/:id': {
		controller: "TerminalController",
		action: 'terminal_edit'
	},
	'/admin/terminals/delete/:id': {
		controller: "TerminalController",
		action: 'terminal_delete'
	},

	'/admin/transactions': {
		controller: "TransactionController",
		action: 'transactions'
	},
	'/admin/transactions/add': {
		controller: "TransactionController",
		action: 'transaction_add'
	},
	'/admin/transactions/edit/:id': {
		controller: "TransactionController",
		action: 'transaction_edit'
	},
	'/admin/transactions/edit/:id': {
		controller: "TransactionController",
		action: 'transaction_edit'
	},
	'/admin/transactions/confirmTransaction': {
		controller: "TransactionController",
		action: 'confirm_transaction'
	},

	'/admin/translations': {
		controller: "TranslationController",
		action: 'translations'
	},
	'/admin/translations/add': {
		controller: "TranslationController",
		action: 'translation_add'
	},
	'/admin/translations/edit/:id': {
		controller: "TranslationController",
		action: 'translation_edit'
	},
	'/admin/translations/delete/:id': {
		controller: "TranslationController",
		action: 'translation_delete'
	},


	'/admin/counties': {
		controller: "CountyController",
		action: 'counties'
	},
	'/admin/counties/add': {
		controller: "CountyController",
		action: 'county_add'
	},
	'/admin/counties/edit/:id': {
		controller: "CountyController",
		action: 'county_edit'
	},
	'/admin/counties/delete/:id': {
		controller: "CountyController",
		action: 'county_delete'
	},


	'/admin/contacts/add': {
		controller: "ContactController",
		action: 'contact_add'
	},
	'/admin/contacts/edit/:id': {
		controller: "ContactController",
		action: 'contact_edit'
	},
	'/admin/contacts/delete/:id': {
		controller: "ContactController",
		action: 'contact_delete'
	},

	'/admin/brokers/add': {
		controller: "BrokerController",
		action: 'broker_add'
	},
	'/admin/brokers/edit/:id': {
		controller: "BrokerController",
		action: 'broker_edit'
	},
	'/admin/brokers/delete/:id': {
		controller: "BrokerController",
		action: 'broker_delete'
	},


	//-----------admin reports-------------
	/*
	'/admin/reports/assets': {
		controller: 'ReportController',
		action: 'assets'
	},
	*/
	'/admin/reports/assets/participants/:id': {
		controller: 'ReportController',
		action: 'assets_participants'
	},
	'/admin/reports/assets/orders/:id': {
		controller: 'ReportController',
		action: 'assets_orders'
	},
	'/admin/reports/assets/transactions/:id': {
		controller: 'ReportController',
		action: 'assets_transactions'
	},
	'/admin/reports/assets/warranties/:id': {
		controller: 'ReportController',
		action: 'assets_warranties'
	},
	'/admin/reports/assets/documents/:id': {
		controller: 'ReportController',
		action: 'assets_documents'
	},
	'/admin/reports/assets/quotes/:id': {
		controller: 'ReportController',
		action: 'assets_quotes'
	},
	'/admin/reports/assets/tradeparams/:id': {
		controller: 'ReportController',
		action: 'assets_tradeparams'
	},
	'/admin/reports/assets/tradesession/:id': {
		controller: 'ReportController',
		action: 'assets_tradesession'
	},
	'/admin/reports': {
		controller: 'ReportController',
		action: 'assets_index'
	},
	'/admin/new_reports': {
		controller: 'ReportController',
		action: 'new_reports_index'
	},
	'/admin/new_reports/view/:id/:ReportName': {
		controller: 'ReportController',
		action: 'new_reports'
	},
	//------------------------------------
	// files

	'get /uploads/*': {
		controller: 'FileController',
		action: 'get'
	},
	'/documents/download/:id': {
		controller: "DocumentController",
		action: 'download'
	},


};
