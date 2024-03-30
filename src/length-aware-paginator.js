import { Page, Collection, QueryBuilder } from ".";

export default class LengthAwarePaginator extends Collection
{
	/**
	 * QueryBuilder instance.
	 * 
	 * @type {QueryBuilder}
	 */
	builder = null;

	/**
	 * Response.
	 * 
	 * @type {Promise<AxiosResponse<any,any>>}
	 */
	response = null;

	/**
	 * Pagination metadata interface.
	 * 
	 * @type {Page}
	 */
	page = new Page;

	/**
	 * Request state.
	 * 
	 * @type {boolean}
	 */
	isPending = false;

	/**
	 * Instantiate length aware paginator.
	 * 
	 * @param {QueryBuilder} builder query builder instance
	 * @param {number=} startPage start page
	 */
	constructor( builder, startPage = 1 )
	{
		super();

		this.builder = builder;

		builder
			.params({ paginate: "length-aware" })
			.page( this.page.currentPage || startPage );

		this.ping();
	}

	/**
	 * Performs a GET request and put retreived data on public
	 * data property and returns paginator.
	 * 
	 * @return {LengthAwarePaginator}
	 */
	ping()
	{
		const once = { once: true }

		this.isPending = true;

		this.builder
			.on( "finished", () => this.isPending = false, once )
			.on( 204, () => this.data = [], once )
			.on( 200, ( collection, response, data ) =>
			{
				this.data = collection.data;
				this.response = response;
				this.#hydrateMeta( response.data );
				this.builder.trigger( "paginated", [ this, response, data ]);
			}, once )
			.get();

		return this;
	}

	/**
	 * Increments the current page number and ping again.
	 * 
	 * @return {LengthAwarePaginator}
	 */
	next()
	{
		if( this.page.end || this.isPending )
		{
			return this;
		}

		this.builder.page( this.page.currentPage + 1 );
		this.ping();

		return this;
	}

	#hydrateMeta( responseBody )
	{
		this.page = new Page;		
		this.builder.model.$pluckPaginations( responseBody, this.page );
	}
}
