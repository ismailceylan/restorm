import { Page, Collection, QueryBuilder } from ".";

/**
 * @typedef {import('axios').AxiosResponse} AxiosResponse
 */
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
	 * @type {Promise<AxiosResponse>}
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
	 * @return {Promise<Collection>}
	 * @emits QueryBuilder#paginated
	 */
	ping()
	{
		const once = { once: true }

		this.isPending = true;

		return this.builder
			.on( "finished", () => this.isPending = false, once )
			.on( 204, () => this.length = 0, once )
			.on( 200, ( collection, response, data ) =>
			{
				this.length = 0;
				this.response = response;

				this.push( ...collection );
				this.#hydrateMeta( response.data );
				
				this.builder.trigger( "paginated", [ this, response, data ]);
			}, once )
			.all();
	}

	/**
	 * Increments the current page number and ping again.
	 * 
	 * @async
	 * @return {Promise<LengthAwarePaginator>}
	 */
	async next()
	{
		if( this.page.end || this.isPending )
		{
			return this;
		}

		this.builder.page( this.page.currentPage + 1 );

		await this.ping();

		return this;
	}

	#hydrateMeta( responseBody )
	{
		this.page = new Page;		
		this.builder.model.$pluckPaginations( this.page, responseBody );
	}
}
