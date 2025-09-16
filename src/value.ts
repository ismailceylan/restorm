/**
 * Represents a value proxy for a string or array.
 */
export default class Value
{
	/**
	 * Represented value.
	 */
	value: (string | number)[] = [];

	/**
	 * Instantiate a value proxy for given value.
	 * 
	 * @param value a value to proxy
	 */
	constructor( value: null | string| number | (string | number)[])
	{
		if( typeof( value ) == "string" )
		{
			this.value = value
				.split( "," )
				.map( item => item.trim());
		}
		else if( Array.isArray( value ))
		{
			this.value = value;
		}
	}

	/**
	 * Returns the proxied value as a string.
	 */
	toString(): string
	{
		return this.value.join( "," );
	}
}
