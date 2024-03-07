import Collection from "./collection";
import QueryBuilder from "./query-builder";

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
	ping()
	{
		const once = { once: true }

		this.builder
			.on( 204, () => this.data = [], once )
			.on( 200, ({ data }, response ) =>
			{
				this.data = data;
				this.response = response;
			}, once )
			.get();

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
