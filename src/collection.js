import { Model } from ".";

/**
 * Extends the built-in Array class.
 */
export default class Collection extends Array
{
	/**
	 * Returns first item of the collection.
	 * 
	 * @return {*|undefined}
	 */
	first()
	{
		return this[ 0 ];
	}

	/**
	 * Returns latest item of the collection.
	 * 
	 * @return {*|undefined}
	 */
	last()
	{
		return this.at( -1 );
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

		this.forEach( item =>
		{
			(( item instanceof Model && item.has( field )) || item.hasOwnProperty( field )) &&
				stack.push( item[ field ])
		});

		return new Collection( stack );
	}

	/**
	 * Returns the json string representation of the collection.
	 * 
	 * @return {string}
	 */
	toJson()
	{
		return JSON.stringify( this );
	}

}
