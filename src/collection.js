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

	/**
	 * Checks if the collection contains the given model or primary key.
	 * 
	 * @param {Model|number|string} modelOrPrimaryKey 
	 * @return {boolean}
	 */
	contains( modelOrPrimaryKey )
	{
		const isTargetModel = modelOrPrimaryKey instanceof Model;

		const index = this.findIndex( item =>
		{
			// item is a model
			if( item instanceof Model )
			{
				// target is a model
				if( isTargetModel )
				{
					// both are same model
					if( item.constructor === modelOrPrimaryKey.constructor )
					{
						// both are share same primary
						return item.primary === modelOrPrimaryKey.primary;
					}
				}
				// target is not a model
				else
				{
					return item.primary === modelOrPrimaryKey;
				}
			}
			// item is not a model
			else
			{
				// target is a model
				if( isTargetModel )
				{
					return item === modelOrPrimaryKey.primary;
				}
				// target and item both are not model
				else if( item === modelOrPrimaryKey )
				{
					return true;
				}
			}
		});

		return index > -1;
	}

	/**
	 * Calculates the difference between the current collection and the
	 * provided items.
	 *
	 * This method filters out the elements from the current collection that
	 * are present in the provided items.
	 *
	 * @param {...Model|Collection<Model>|Model[]} items - The items to compare with
	 * the current collection. Can be a spread of arguments or a single collection.
	 * @return {Collection} A new collection with elements from the current
	 * collection that are not present in the provided items.
	 */
	diff( ...items )
	{
		if( items.length === 1 && Array.isArray( items[ 0 ]))
		{
			items = new Collection( ...items[ 0 ]);
		}
		else if( items.length > 0 )
		{
			items = new Collection( ...items );
		}

		return this.filter( item =>
			! items.contains( item )
		);
	}
}
