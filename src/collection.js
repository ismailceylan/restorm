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
	 * Concatenates the elements of the current collection with the elements of one
	 * or more other collections or collection and returns a new collection.
	 *
	 * @param {...array<*>} items - The collections or collections to concatenate
	 * with the current collection.
	 * @return {Collection} - A new collection containing the concatenated elements.
	 */
	concat( ...items )
	{
		return this.#arrayProxy( "concat", arguments );
	}

	/**
	 * Returns the elements of a collection that meet the condition specified
	 * in a callback function.
	 *
	 * @param {(value: *, index: number, array: *[]) => *} predicate - A function
	 * that accepts up to three arguments. The filter method calls the predicate
	 * function one time for each element in the collection.
	 * @param {object} [thisArg] - An object to which the this keyword can refer
	 * in the predicate function. If thisArg is omitted, undefined is used as
	 * the this value.
	 * @return {Collection} A new collection with the filtered elements.
	 */
	filter( predicate, thisArg )
	{
		return this.#arrayProxy( "filter", arguments );
	}

	/**
	 * Returns a new collection with all sub-collection elements concatenated
	 * into it recursively up to the specified depth.
	 * 
	 * @param {number} [depth=1] - The maximum recursion depth 
	 * @return {Collection} - A new collection with the flattened elements.
	 */
	flat( depth = 1 )
	{
		return this.#arrayProxy( "flat", arguments );
	}

	/**
	 * Calls a defined callback function on each element of an collection. Then,
	 * flattens the result into a new collection. This is identical to a map
	 * followed by flat with depth 1.
	 *
	 * @param {(value: *, index: number, array: *[]) => *} callback - A function that accepts up to three
	 * arguments. The flatMap method calls the callback function one time
	 * for each element in the collection.
	 * @param {?object} [thisArg] - An object to which the this keyword can
	 * refer in the callback function. If thisArg is omitted, undefined is
	 * used as the this value.
	 * @return {Collection} - A new collection that contains the flattened
	 * results of the callback function.
	 */
	flatMap( callback, thisArg )
	{
		return this.#arrayProxy( "flatMap", arguments );
	}

	/**
	 * Calls a defined callback function on each element of a collection, and
	 * returns a collection that contains the results.
	 *
	 * @param {(value: *, index: number, array: any[])=> *} callbackfn - A function
	 * that accepts up to three arguments. The map method calls the callbackfn
	 * function one time for each element in the collection.
	 * @param {object} [thisArg] - An object to which the this keyword can refer
	 * in the callbackfn function. If thisArg is omitted, undefined is used as
	 * the this value.
	 * @return {Collection} - A new collection with the results of mapping.
	 */
	map( callbackfn, thisArg )
	{
		return this.#arrayProxy( "map", arguments );
	}

	/**
	 * Returns a copy of a section of an collection. For both start and end, a
	 * negative index can be used to indicate an offset from the end of the
	 * collection. For example, -2 refers to the second to last element of the
	 * collection.
	 *
	 * @param {number} [start] - The beginning index of the specified portion of the
	 * collection. If start is undefined, then the slice begins at index 0.
	 * @param {number} [end] - The end index of the specified portion of the collection.
	 * This is exclusive of the element at the index 'end'. If end is undefined, then
	 * the slice extends to the end of the collection.
	 * @return {Collection} - A new Collection instance containing the sliced portion
	 * of the original collection.
	 */
	slice( start, end )
	{
		return this.#arrayProxy( "slice", arguments );
	}

	/**
	 * Returns a copy of a section of a collection. For both start and end, a
	 * negative index can be used to indicate an offset from the end of the
	 * collection. For example, -2 refers to the second to last element of
	 * the collection.
	 *
	 * @param {number} [start] - The beginning index of the specified portion of
	 * the collection. If start is undefined, then the slice begins at index 0.
	 * @param {number} [end] - The end index of the specified portion of the
	 * collection. This is exclusive of the element at the index 'end'. If end is
	 * undefined, then the slice extends to the end of the collection.
	 * @return {Collection} - A new Collection instance containing the sliced portion
	 * of the original collection.
	 */
	slice( start, end )
	{
		return this.#arrayProxy( "slice", arguments );
	}

	/**
	 * Clones current collection and calls toReversed method on it and returns it.
	 *
	 * @return {Collection} - A new Collection instance containing the reversed elements.
	 */
	toReversed()
	{
		return this.#arrayProxy( "toReversed", arguments );
	}

	/**
	 * Clones current collection and calls toSorted method on it and returns the
	 * sorted collection.
	 * 
	 * @param {(a:*, b:*) => number} [compareFn] - Function used to determine the
	 * order of the elements. It is expected to return a negative value if the first
	 * argument is less than the second argument, zero if they're equal, and a positive
	 * value otherwise. If omitted, the elements are sorted in ascending, ASCII character
	 * order.
	 */
	toSorted( compareFn )
	{
		return this.#arrayProxy( "toSorted", arguments );
	}

	/**
	 * Creates a new collection by splicing the current collection at the specified
	 * index with the specified number of elements to delete and the specified items
	 * to add.
	 * 
	 * It returns a new collection with some elements removed and/or replaced at a
	 * given index.
	 *
	 * @param {number} start - The index at which to start changing the collection.
	 * @param {number} [deleteCount] - The number of elements to remove.
	 * @param {...*} items - The elements to add to the collection, beginning from the
	 * start index.
	 * @return {Collection} - A new Collection instance containing the spliced elements.
	 */
	toSpliced( start, deleteCount, ...items )
	{
		return this.#arrayProxy( "toSpliced", arguments );
	}

	/**
	 * The copying version of using the bracket notation to change the value of a
	 * given index. It returns a new collection with the element at the given index
	 * replaced with the given value.
	 *
	 * @param {number} index - Zero-based (negative supports) index of the value to
	 * be replaced.
	 * @param {*} value - Any value to be assigned to the given index.
	 * @return {Collection} - A new Collection instance with the replaced value.
	 */
	with( index, value )
	{
		return this.#arrayProxy( "with", arguments );
	}

	/**
	 * Creates a new collection and performs collection operations on it and returns it.
	 * 
	 * With this, we can make sure that the original collection is not mutated.
	 *
	 * @param {string} methodName - The name of the method to be proxied.
	 * @param {array} args - The arguments to be passed to the method.
	 * @return {Collection} A new Collection instance containing the method's results.
	 */
	#arrayProxy( methodName, args )
	{
		const collection = new Collection;

		collection.push(
			...super[ methodName ]( ...args ) 
		);

		return collection;
	}
}
