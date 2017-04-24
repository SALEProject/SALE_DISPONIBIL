/**
 * agencies
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
	req.session.params = [
		{
			'label' : 'PartialFlagChangeAllowed',
			'name' : 'Permite modificarea atributului de total/partial la modificarea ordinelor',
		},
		{
			'label' : 'InitialPriceMandatory',
			'name' : 'Pretul unui ordin initiator este obligatoriu',
		},
		{
			'label' : 'InitialPriceMaintenance',
			'name' : 'Permite intretinerea pretului in ordinul initiator in faza 1 si 2 (deschidere si tranzactionare)',
		},
		{
			'label' : 'DiminishedQuantityAllowed',
			'name' : 'Permite inrautatirea cantitatii',
		},
		{
			'label' : 'DiminishedPriceAllowed',
			'name' : 'Permite inrautatirea pretului',
		},
	//	{
	//		'label' : 'OppositeDirectionAllowed',
	//		'name' : 'Permite ordine directie opusa',
	//	},
		{
			'label' : 'DifferentialPriceAllowed',
			'name' : 'Permite pret referinta',
		}
	];

	return next();
};
