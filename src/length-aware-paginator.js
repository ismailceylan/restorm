import Collection from "./collection";

export default class LengthAwarePaginator extends Collection
{
	/**
	 * Start page number.
	 * 
	 * @type {number}
	 */
	startPage = 1;

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
	 * Instantiate length aware paginator.
	 * 
	 * @param {QueryBuilder} builder query builder instance
	 * @param {number=} startPage start page
	 */
	constructor( builder, startPage = 1 )
	{
		super();

		this.builder = builder;
		this.startPage = startPage;

		builder
			.params({ paginate: "length-aware" })
			.page( startPage );

		this.ping();
	}

	/**
	 * Performs a GET request and put retreived data on public
	 * data property and returns paginator.
	 * 
	 * @return {LengthAwarePaginator}
	 */
	async ping()
	{
		this.response = await this.builder.$$get();

		this.data = this.builder.model
			.$pluck( this.response.data )
			.map( item =>
				new this.builder.model( item )
			);

		return this;
	}

	/**
	 * Increments the current page number and ping again.
	 * 
	 * @return {LengthAwarePaginator}
	 */
	async next()
	{
		this.builder.page( ++this.startPage );
		return this.ping();
	}
}
