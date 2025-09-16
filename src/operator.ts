import { operatorMap } from "./utils";

/**
 * Represents any operator.
 */
export default class Operator
{
	/**
	 * The operator.
	 */
	operator: string = null;

	/**
	 * Creates a new operator.
	 * 
	 * @param operator the operator as string
	 */
	constructor( operator: string )
	{
		this.operator = operator;
	}

	/**
	 * Returns the corresponding string representation of the operator.
	 */
	toString(): string
	{
		return operatorMap[ this.operator ] || this.operator;
	}
}
