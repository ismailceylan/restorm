/**
 * Represents pagination metadata.
 */
export default class Page
{
	/**
	 * Metadata repo.
	 * 
	 * @type {object}
	 */
	meta = {}

	/**
	 * Sets current page number.
	 * 
	 * @param {number} value current page
	 */
	set currentPage( value )
	{
		this.meta.currentPage = value;
	}

	/**
	 * Returns current page number.
	 * 
	 * @return {number}
	 */
	get currentPage()
	{
		return this.meta.currentPage;
	}

	/**
	 * Sets from number.
	 * 
	 * @param {number} value from number
	 */
	set from( value )
	{
		this.meta.from = value;
	}

	/**
	 * Returns from number.
	 * 
	 * @return {number}
	 */
	get from()
	{
		return this.meta.from;
	}

	/**
	 * Sets last page number.
	 * 
	 * @param {number} value last page number
	 */
	set lastPage( value )
	{
		this.meta.lastPage = value;
	}

	/**
	 * Returns last page number.
	 * 
	 * @return {number}
	 */
	get lastPage()
	{
		return this.meta.lastPage;
	}

	/**
	 * Sets items per page number.
	 * 
	 * @param {number} value items per page number
	 */
	set perPage( value )
	{
		this.meta.perPage = value;
	}

	/**
	 * Returns items per page number.
	 * 
	 * @return {number}
	 */
	get perPage()
	{
		return this.meta.perPage;
	}

	/**
	 * Sets the position of the last item among all items.
	 * 
	 * @param {number} value relative position of the last item
	 */
	set to( value )
	{
		this.meta.to = value;
	}

	/**
	 * Returns the position of the last item among all items.
	 * 
	 * @return {number}
	 */
	get to()
	{
		return this.meta.to;
	}

	/**
	 * Sets total item count.
	 * 
	 * @param {number} value total items count
	 */
	set total( value )
	{
		this.meta.total = value;
	}

	/**
	 * Returns total item count.
	 * 
	 * @return {number}
	 */
	get total()
	{
		return this.meta.total;
	}

	/**
	 * Returns if current page was the latest page or not.
	 * 
	 * @return {boolean}
	 */
	get end()
	{
		return this.currentPage >= this.lastPage;
	}
}
