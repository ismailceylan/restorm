import { operatorMap } from "./utils";

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
		return operatorMap[ this.operator ] || this.operator;
	}
}
