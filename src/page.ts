/**
 * Represents pagination metadata.
 */
export default class Page
{
	/**
	 * Metadata repo.
	 */
	meta: PageMetas = {}

	/**
	 * Sets current page number.
	 * 
	 * @param value current page
	 */
	set currentPage( value: number )
	{
		this.meta.currentPage = value;
	}

	/**
	 * Returns current page number.
	 */
	get currentPage(): number
	{
		return this.meta.currentPage;
	}

	/**
	 * Sets from number.
	 * 
	 * @param value from number
	 */
	set from( value: number )
	{
		this.meta.from = value;
	}

	/**
	 * Returns from number.
	 */
	get from(): number
	{
		return this.meta.from;
	}

	/**
	 * Sets last page number.
	 * 
	 * @param value last page number
	 */
	set lastPage( value: number )
	{
		this.meta.lastPage = value;
	}

	/**
	 * Returns last page number.
	 */
	get lastPage(): number
	{
		return this.meta.lastPage;
	}

	/**
	 * Sets items per page number.
	 * 
	 * @param value items per page number
	 */
	set perPage( value: number )
	{
		this.meta.perPage = value;
	}

	/**
	 * Returns items per page number.
	 */
	get perPage(): number
	{
		return this.meta.perPage;
	}

	/**
	 * Sets the position of the last item among all items.
	 * 
	 * @param value relative position of the last item
	 */
	set to( value: number )
	{
		this.meta.to = value;
	}

	/**
	 * Returns the position of the last item among all items.
	 */
	get to(): number
	{
		return this.meta.to;
	}

	/**
	 * Sets total item count.
	 * 
	 * @param value total items count
	 */
	set total( value: number )
	{
		this.meta.total = value;
	}

	/**
	 * Returns total item count.
	 */
	get total(): number
	{
		return this.meta.total;
	}

	/**
	 * Returns if current page was the latest page or not.
	 */
	get end(): boolean
	{
		return this.currentPage >= this.lastPage;
	}
}

export interface PageMetas
{
	currentPage?: number;
	from?: number;
	lastPage?: number;
	perPage?: number;
	to?: number;
	total?: number;
}
