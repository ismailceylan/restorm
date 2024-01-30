import { Model } from ".";

export default class Collection
{
	#data = [];

	constructor( data = [])
	{
		this.#data = data;
	}

	get size()
	{
		return this.#data.length;
	}

	first()
	{
		return this.#data[ 0 ];
	}

	last()
	{
		return this.#data[ this.size - 1 ];
	}

	get( index )
	{
		return this.#data[ index ];
	}

	forEach()
	{
		this.#data.forEach( ...arguments );
		return this;
	}

	map()
	{
		return new Collection(
			this.#data.map( ...arguments )
		);
	}

	filter()
	{
		return new Collection(
			this.#data.filter( ...arguments )
		);
	}
	
	reduce()
	{
		return new Collection(
			this.#data.reduce( ...arguments )
		);
	}

	pluck( field )
	{
		const stack = [];

		this.#data.forEach( item =>
		{
			(( item instanceof Model && item.has( field )) || item.hasOwnProperty( field )) &&
				stack.push( item[ field ])
		});

		return new Collection( stack );
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
