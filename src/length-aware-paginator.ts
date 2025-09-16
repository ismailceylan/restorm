import { AxiosResponse } from "axios";
import { Page, Collection, QueryBuilder, Model } from ".";

/**
 * Length aware paginator class. It extends collection class
 * which is extends array.
 */
export default class LengthAwarePaginator<T extends Model = Model> extends Collection<T>
{
	/**
	 * QueryBuilder instance.
	 */
	builder: QueryBuilder = null;

	/**
	 * Response.
	 */
	response: AxiosResponse = null;

	/**
	 * Pagination metadata interface.
	 */
	page: Page = new Page;

	/**
	 * Request state.
	 */
	isPending: boolean = false;

	/**
	 * Instantiate length aware paginator.
	 * 
	 * @param builder query builder instance
	 * @param startPage start page
	 */
	constructor( builder: QueryBuilder, startPage?: number )
	{
		super();

		this.builder = builder;

		builder
			.params({ paginate: "length-aware" })
			.page( this.page.currentPage || startPage || 1 );

		this.ping();
	}

	/**
	 * Performs a GET request and put retreived data on public
	 * data property and returns paginator.
	 * 
	 * @emits QueryBuilder#paginated
	 */
	ping(): Promise<Collection<T>>
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

				if( collection instanceof Collection )
				{
					this.push( ...( collection as Collection<T>));
				}
				
				this.hydrateMeta( response.data );
				
				this.builder.trigger( "paginated", [ this, response, data ]);
			}, once )
			.all() as Promise<Collection<T>>;
	}

	/**
	 * Increments the current page number and ping again.
	 */
	async next(): Promise<LengthAwarePaginator<T>>
	{
		if( this.page.end || this.isPending )
		{
			return this;
		}

		this.builder.page( this.page.currentPage + 1 );

		await this.ping();

		return this;
	}

	/**
	 * Hydrates pagination metadata.
	 * 
	 * @param responseBody plain object which is the response body
	 */
	private hydrateMeta( responseBody: {})
	{
		this.page = new Page;		
		this.builder.model.$pluckPaginations( this.page, responseBody );
	}
}
