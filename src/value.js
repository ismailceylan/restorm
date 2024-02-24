export default class Value
{
	value = [];

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

	toString()
	{
		return this.value.join( "," );
	}
}
