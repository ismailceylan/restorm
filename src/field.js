export default class Field
{
	/**
	 * Field segments.
	 * 
	 * @type {array}
	 */
	field = [];

	/**
	 * Instantiate a new field representation.
	 * 
	 * @param {string|array} field single or multiple field name(s)
	 */
	constructor( field )
	{
		if( typeof( field ) == "string" )
		{
			this.field = field.split( "." );
		}
		else
		{
			this.field = field;
		}
	}

	/**
	 * Compile the field representation into suitable querystring
	 * variable name.
	 * 
	 * @return {string}
	 */
	toString()
	{
		return "[" + this.field.join( "." ) + "]";
	}
}
