export default class Collection
{
	#data = [];

	constructor( data, Model )
	{
		this.#data = data.map( item =>
			new Model( item )
		);
	}

	first()
	{
		return this.#data[ 0 ];
	}

	get( index )
	{
		return this.#data[ index ];
	}

	[ Symbol.iterator ]()
	{
		let index = 0;

		return {
			next: () =>
			{
				if( index < this.#data.length )
				{
					return {
						value: this.#data[ index++ ],
						done: false
					}
				}
				else
				{
					return { done: true }
				}
			}
		}
	}
}

Object.setPrototypeOf( Collection.prototype, new Proxy( Collection.prototype,
{
	get( _target, key, instance )
	{
		if( isNaN( key ) == false )
		{
			return instance.get( key );
		}
	}
}));
