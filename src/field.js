export default class Field
{
	field = [];

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

	toString()
	{
		return "[" + this.field.join( "." ) + "]";
	}
}
