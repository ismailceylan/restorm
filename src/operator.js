/**
 * Represents any operator.
 */
export default class Operator
{
	/**
	 * The operator.
	 * 
	 * @type {string}
	 */
	operator = null;

	/**
	 * The operator map.
	 * 
	 * @type {object}
	 */
	operatorMap =
	{
		// equal
		"=": "eq",
		"equal": "eq",

		// not equal
		"!=": "ne",
		"<>": "ne",
		"notequal": "ne",
		
		// less than
		"<": "lt",
		"less": "lt",
		
		// greater than
		">": "gt",
		"greater": "gt",
		
		// less or equal
		"<=": "lte",
		"lesseq": "lte",
		
		// equal or greater
		">=": "gte",
		"greatereq": "gte",
		
		// between
		"><": "bw",
		"between": "bw",
		
		// not between
		"!><": "nbw",
		"notbetween": "nbw",

		"...": "in",
		"in": "in",
		
		// like
		"~": "lk",
		"like": "lk",
		
		// not like
		"!~": "nlk",
		"notlike": "nlk",
		
		// null
		"=n": "nl",
		"null": "nl",
		
		// not null
		"!n": "nn",
		"notnull": "nn",
	}

	/**
	 * Creates a new operator.
	 * 
	 * @param {string} operator
	 */
	constructor( operator )
	{
		this.operator = operator;
	}

	/**
	 * Returns the corresponding string representation of the operator.
	 *
	 * @return {string}
	 */
	toString()
	{
		return this.operatorMap[ this.operator ] || this.operator;
	}
}
