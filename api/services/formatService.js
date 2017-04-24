var numeral = require('numeral');
// load a language
numeral.language('ro', {
	delimiters: {
		thousands: '.',
		decimal: ','
	},
	abbreviations: {
		thousand: 'k',
		million: 'm',
		billion: 'b',
		trillion: 't'
	},
	ordinal : function (number) {
		return number === 1 ? 'ul' : 'lea';
	},
	currency: {
		symbol: 'Lei'
	}
});

numeral.language('en', {
	delimiters: {
		thousands: ',',
		decimal: '.'
	},
	abbreviations: {
		thousand: 'k',
		million: 'm',
		billion: 'b',
		trillion: 't'
	},
	ordinal : function (number) {
		return number === 1 ? 'st' : (number === 2 ? 'nd' : (number === 3 ? 'rd' : th));
	},
	currency: {
		symbol: '$'
	}
});

// switch between languages
numeral.language('ro');

exports.numeral = function(x) {
    return numeral(x);
};

exports.formatLocale = function(number,lang,prec) {
	numeral.language(lang.code.toLowerCase());
    return numeral(number).format(formatService.getLocaleFormat(lang,(typeof prec != 'undefined' ? prec : 0)));
};

exports.getLocaleFormat = function(lang,prec) {
	var format = '0,0';
	if(prec>0) {
		format += '.';
		for(var i=0;i<prec;i++) {
			format += '0';
		}
	}
	return format;
};

exports.getSteppingDecimal = function(val) {
	var match = (''+val).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
	if (!match) { 
		return 0;
	}
	return Math.max(
		0,
		// Number of digits right of decimal point.
		(match[1] ? match[1].length : 0)
		// Adjust for scientific notation.
		- (match[2] ? +match[2] : 0)
	);
};