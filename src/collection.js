import { Model } from ".";

export default class Collection
{
	/**
	 * Holds original list of data.
	 * 
	 * @type {array}
	 */
	data = [];

	/**
	 * Instantiate a collection that represents given array.
	 * 
	 * @param {array=} data a data list
	 */
	constructor( data = [])
	{
		this.data = data;
	}

	/**
	 * Returns length of the collection.
	 * 
	 * @readonly
	 * @return {number}
	 */
	get size()
	{
		return this.data.length;
	}

	/**
	 * Changes the list of data that the collection will represent.
	 * 
	 * @param {array} data new data list
	 */
	set data( data )
	{
		this.data = data;
	}

	/**
	 * Returns first item of the collection.
	 * 
	 * @return {*}
	 */
	first()
	{
		return this.data[ 0 ];
	}

	/**
	 * Returns latest item of the collection.
	 * 
	 * @return {*}
	 */
	last()
	{
		return this.data[ this.size - 1 ];
	}

	/**
	 * Returns the item with the given position from the list
	 * of data.
	 * 
	 * @param {number} index position number
	 * @return {*}
	 */
	get( index )
	{
		return this.data[ index ];
	}

	/**
	 * Performs the specified action for each element in an
	 * array.
	 * 
	 * It is an alias native Array method and it takes the
	 * same parameters.
	 * 
	 * @return {Collection}
	 */
	forEach()
	{
		this.data.forEach( ...arguments );
		return this;
	}

	/**
	 * It pass the given parameters to the `Array.map` method and
	 * creates and returns a new collection from the returned result.
	 * 
	 * @return {Collection}
	 */
	map()
	{
		return new Collection(
			this.data.map( ...arguments )
		);
	}

	/**
	 * It pass the given parameters to the `Array.filter` method and
	 * creates and returns a new collection from the returned result.
	 * 
	 * @return {Collection}
	 */
	filter()
	{
		return new Collection(
			this.data.filter( ...arguments )
		);
	}

	/**
	 * It pass the given parameters to the `Array.sort` method and
	 * creates and returns a new collection from the returned result.
	 * 
	 * @return {Collection}
	 */
	sort( compareFn )
	{
		return new Collection(
			this.data.sort( compareFn )
		);
	}

	/**
	 * It pass the given parameters to the `Array.reduce` method and
	 * creates and returns a new collection from the returned result.
	 * 
	 * @return {Collection}
	 */
	reduce()
	{
		return new Collection(
			this.data.reduce( ...arguments )
		);
	}

	/**
	 * Creates and returns a new collection consisting of the
	 * data in a field called.
	 * 
	 * @param {string} field field name whose values will be collected
	 * @return {Collection}
	 */
	pluck( field )
	{
		const stack = [];

		this.data.forEach( item =>
		{
			(( item instanceof Model && item.has( field )) || item.hasOwnProperty( field )) &&
				stack.push( item[ field ])
		});

		return new Collection( stack );
	}

	/**
	 * Returns the array representation of the collection.
	 * 
	 * @return {array}
	 */
	toArray()
	{
		return this.data;
	}

	/**
	 * Returns the json string representation of the collection.
	 * 
	 * @return {string}
	 */
	toString()
	{
		return JSON.stringify( this.data );
	}

	/**
	 * Returns an iteration interface. Thus, the collection can be
	 * included in array operations and behave like an array.
	 * 
	 * ```js
	 * const items = new Collection([ 1, 2, 3 ]);
	 * 
	 * console.log( ...items );
	 * // 1 2 3
	 * 
	 * console.log( Array.from( items ).join( "-" ));
	 * // 1-2-3
	 * 
	 * for( const item of items )
	 * {
	 *     console.log( item );
	 * }
	 * 
	 * // 1
	 * // 2
	 * // 3
	 * ```
	 * 
	 * @return {object}
	 */
	[ Symbol.iterator ]()
	{
		let index = 0;

		return {
			next: () =>
			{
				console.log(this);
				if( index < this.data.length )
				{
					return {
						value: this.data[ index++ ],
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
		if( typeof( key ) != "symbol" && isNaN( key ) == false )
		{
			return instance.get( key );
		}
	}
}));
