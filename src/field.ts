/**
 * Field representation.
 */
export default class Field
{
	/**
	 * Field segments.
	 */
	field: string[] = [];

	/**
	 * Instantiate a new field representation.
	 * 
	 * @param field single or multiple field name(s)
	 */
	constructor( field: string|string[])
	{
		this.field = typeof field == "string"
			? field.split( "." )
			: field;
	}

	/**
	 * Compile the field representation into suitable querystring variable name.
	 */
	toString(): string
	{
		return "[" + this.field.join( "." ) + "]";
	}
}
