export default class Collection
{
	data = [];

	constructor( data, Model )
	{
		this.data = data.map( item =>
			new Model( item )
		);
	}

	first()
	{
		return this.data[ 0 ];
	}
}
