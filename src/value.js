export default class Value
{
	value = [];

	constructor( value )
	{
		this.value = typeof( value ) == "string"
			? value.split( "," ).map( item => item.trim())
			: [ value ];
	}

	toString()
	{
		return this.value.join( "," );
	}
}
