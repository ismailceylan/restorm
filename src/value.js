export default class Value
{
	/**
	 * Represented value.
	 * 
	 * @type {array}
	 */
	value = [];

	/**
	 * Instantiate a value proxy for given value.
	 * 
	 * @param {string|array} value a value to proxy
	 */
	constructor( value )
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
	 *  
	 * @return {string}
	 */
	toString()
	{
		return this.value.join( "," );
	}
}
