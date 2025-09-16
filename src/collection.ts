import { Model } from ".";

/**
 * Extends the built-in Array class.
 */
export default class Collection<T = void> extends Array<T>
{
	static get [ Symbol.species ]()
	{
		return Array;
	}

	/**
	 * Returns first item of the collection.
	 */
	first(): T
	{
		return this[ 0 ];
	}

	/**
	 * Returns latest item of the collection.
	 */
	last(): T
	{
		return this[ this.length - 1 ];
	}

	/**
	 * Creates and returns a new collection consisting of the
	 * data in a field called.
	 * 
	 * @param field field name whose values will be collected
	 */
	pluck<K extends keyof T>( field: K ): Collection<T[K]>
	{
		const stack: T[K][] = [];

		this.forEach( item =>
		{
			const hasField = ( item instanceof Model && item.has( field )) || item.hasOwnProperty( field );

			if( hasField )
			{
				stack.push( item[ field ])
			}
		});

		return new Collection( ...stack );
	}

	/**
	 * Returns the json string representation of the collection.
	 */
	toJson(): string
	{
		return JSON.stringify(
			this.map( item =>
				item instanceof Model? item.original : item
			),
		);
	}

	/**
	 * Checks if the collection contains the given model or primary key.
	 * 
	 * @param modelOrPrimaryKey model or primary key
	 */
	contains( modelOrPrimaryKey: Model | number | string ): boolean
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
	 * @param items - The items to compare with the current collection. Can
	 * be a spread of arguments or a single collection.
	 * @return A new collection with elements from the current collection
	 * that are not present in the provided items.
	 */
	diff( ...items: ( T | Collection<T> | T[])[]): Collection<T>
	{
		// normalize to a flat Collection<T>
		let compare: Collection<T>;
	
		if( items.length === 1 )
		{
			const first = items[ 0 ];
		
			if( first instanceof Collection )
			{
				compare = first;
			}
			else if( Array.isArray( first ))
			{
				compare = new Collection<T>( ...first );
			}
			else
			{
				compare = new Collection<T>( first as T );
			}
		}
		else
		{
			compare = new Collection<T>( ...items as T[]);
		}

		return new Collection<T>(
			...this.filter( item => ! compare.includes( item ))
		);
	}

}
