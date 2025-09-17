import { camelToDash } from "./utils";
import { Collection, LengthAwarePaginator, Page, QueryBuilder } from ".";
import { AxiosResponse, AxiosError } from "axios";
import type { EventListenerOptions, EventMap, FieldArg } from "./query-builder";
import type { RestormResponse, WhereCondition, WhereOperators } from "./query-builder";

export default class Model
{
	/**
	 * The field name to use as the primary key.
	 */
	static primaryKey: string = "id";

	/**
	 * The root URL for the API that serving resources restful way.
	 */
	static baseURL: string = "";

	/**
	 * The resource url piece that the model targets.
	 */
	static resource: string = "";

	/**
	 * Cast map to be applied to all models.
	 */
	static casts: object = {}

	/**
	 * The default number of items per page.
	 */
	static itemsPerPage: number = 10;
	
	/**
	 * The QueryBuilder instance for the model instance.
	 */
	query: null|QueryBuilder = null;

	/**
	 * Modifications made to the represented model instance.
	 */
	modified: object = {}

	/**
	 * Safe area for the original data of the model instance.
	 */
	original: object = {}

	/**
	 * Tells whether any modifications have been made to the model instance.
	 */
	isDirty: boolean = false;

	/**
	 * Returns the value of the primary key whose name is defined on the model.
	 */
	get primary(): string
	{
		return this.original[
			( this.constructor as typeof Model ).primaryKey
		];
	}

	/**
	 * Instantiates the model with the given data.
	 * 
	 * @param properties original data of the model
	 * @param casts additional casting map to apply the model when data retreived
	 */
	constructor( properties: object = {}, casts = {})
	{
		this.init( properties, casts );

		this.query = ( this.constructor as typeof Model ).createBuilder( this );

		return new Proxy( this,
		{
			set( instance, key, val )
			{
				if( key === "original" )
				{
					instance.original = val;
				}
				// if the new value is same as original, then
				// it doesn't need to be in the modified
				else if( instance.original[ key ] === val )
				{
					// value set is same as original, so if we
					// have a modified key we can delete it
					// let's check if it exists in modified
					if( key in instance.modified )
					{
						delete instance.modified[ key ];
						instance.isDirty = Object.keys( instance.modified ).length > 0;
					}
				}
				else
				{
					instance.modified[ key ] = val;
					instance.isDirty = true;
				}
		
				return true;
			},

			get( instance, key, o )
			{
				if( key === Symbol.toStringTag )
				{
					return "Model";
				}

				return instance.original[ key ] || instance[ key ];
			}
		});
	}

	/**
	 * Creates a QueryBuilder instance, sets fields that 
	 * resources will contain and returns the QueryBuilder.
	 * 
	 * --------------------------------------------------------
	 * 
	 * @param singleFieldNameFieldsArrOrFieldsMap field
	 * name fields array or fields map object
	 * @param fields fields list
	 * @example
	 * ```js
	 * // adding fields to the model
	 * Post.select([ "field1", "field2", ... ]);
	 * // adding fields to a sub-resource
	 * Post.select( "comments", [ "field1", "field2", ... ]);
	 * // adding fields to the multiple sub-resource at once
	 * Post.select(
	 * {
	 *     comments: [ "field1", "field2", ... ],
	 *     author: [ "field1", "field2", ... ],
	 *     // ...
	 * })
	 * ```
	 */
	static select(
		singleFieldNameFieldsArrOrFieldsMap: string | string[] | object,
		fields: any[] = []
	): QueryBuilder
	{
		return this
			.createBuilder()
			.select( singleFieldNameFieldsArrOrFieldsMap, fields );
	}

	/**
	 * Creates a QueryBuilder instance, adds filtering
	 * instructions in it and returns the QueryBuilder.
	 * 
	 * ------------------------------------------------
	 * 
	 * @example
	 * ### Filtering Current Resource Field
	 * ```js
	 * Post.where( "state", "approved" );
	 * ```
	 * 
	 * ### Filtering Current Resource With Multiple Possible Values
	 * ```js
	 * Post.where( "state", [ "deleted", "pending" ]);
	 * ```
	 * 
	 * ### Filtering Related Resource's Field
	 * ```js
	 * Post.where([ "comments", "type" ], "vip" );
	 * // or 
	 * Post.where( "comments.type", "vip" );
	 * ```
	 * 
	 * ### Filtering Related Resource With Multiple Possible Values
	 * ```js
	 * Post.where([ "comments", "type" ], [ "vip", "median" ]);
	 * ```
	 * 
	 * ### Using All Kind Of Filtering By One Method Call With Object Syntax
	 * ```js
	 * Post.where(
	 * {
	 *     state: "approved",
	 *     comments:
	 *     {
	 *         type: [ "vip", "median" ],
	 *         foo: "bar"
	 *     },
	 *     likes:
	 *     {
	 *         member_status: "vip"
	 *     },
	 *     "lorem.ipsum": "value",
	 *     [ relation + ".foo" ]: "value"
	 * });
	 * ```
	 */
	static where(
		fieldNameOrWhereMap: FieldArg,
		operatorOrValue: WhereOperators,
		value: WhereCondition
	): QueryBuilder
	{
		return this
			.createBuilder()
			.where( fieldNameOrWhereMap as any, operatorOrValue as WhereOperators, value );
	}

	/**
	 * Creates a QueryBuilder instance, adds a where clause to check
	 * if a field is null, and returns the QueryBuilder.
	 *
	 * @param fieldNameOrWhereMap name of the field to check for null
	 */
	static whereNull( fieldNameOrWhereMap: FieldArg ): QueryBuilder
	{
		return this.createBuilder().whereNull( fieldNameOrWhereMap );
	}

	/**
	 * Creates a QueryBuilder instance, adds a where clause to check
	 * if a field is not null, and returns the QueryBuilder.
	 *
	 * @param fieldNameOrWhereMap name of the field to check for not null
	 */
	static whereNotNull( fieldNameOrWhereMap: FieldArg ): QueryBuilder
	{
		return this.createBuilder().whereNotNull( fieldNameOrWhereMap );
	}

	/**
	 * Creates a QueryBuilder instance, adds a where clause to check
	 * if a field is between two values, and returns the QueryBuilder.
	 *
	 * @param fieldNameOrWhereMap name of field to check for between values
	 * @param range minimum and maximum value
	 * @param not whether to negate the condition
	 */
	static whereBetween(
		fieldNameOrWhereMap: FieldArg,
		range: null | number[] = null,
		not: boolean = false
	): QueryBuilder
	{
		return this
			.createBuilder()
			.whereBetween( fieldNameOrWhereMap, range, not );
	}

	/**
	 * Creates a QueryBuilder instance, adds a where clause to check
	 * if a field is not between two values, and returns the QueryBuilder.
	 *
	 * @param fieldNameOrWhereMap name of field to
	 * check for not between values
	 * @param range minimum and maximum value
	 */
	static whereNotBetween(
		fieldNameOrWhereMap: FieldArg,
		range: number[]
	): QueryBuilder
	{
		return this
			.createBuilder()
			.whereNotBetween( fieldNameOrWhereMap, range );
	}

	/**
	 * Creates a QueryBuilder instance, adds a where clause to check if a
	 * field is in a list of values, and returns the QueryBuilder.
	 *
	 * @param fieldNameOrWhereMap name of field to check for values in the list
	 * @param values list of values to check against
	 */
	static whereIn( fieldNameOrWhereMap: FieldArg, values: []): QueryBuilder
	{
		return this
			.createBuilder()
			.whereIn( fieldNameOrWhereMap, values );
	}

	/**
	 * Creates a QueryBuilder instance, adds a where clause to check if a
	 * field is not in a list of values, and returns the QueryBuilder.
	 *
	 * @param fieldNameOrWhereMap name of the field to check for not in values
	 * @param values list of values to check against
	 */
	static whereNotIn( fieldNameOrWhereMap: FieldArg, values: []): QueryBuilder
	{
		return this.createBuilder().whereNotIn( fieldNameOrWhereMap, values );
	}

	/**
	 * Creates a QueryBuilder instance, adds sorting
	 * instructions in it and returns the QueryBuilder.
	 * 
	 * ------------------------------------------------
	 * 
	 * @param field field name or an object to order by
	 * @param mode order mode (asc or desc)
	 * @example
	 * ### Ordering Current Resource Fields
	 * ```js
	 * Post.orderBy( "id" );
	 * // first posts first
	 * Post.orderBy( "created_at", "desc" );
	 * // latest posts first
	 * ```
	 * 
	 * ### Ordering Related Resource Fields
	 * ```js
	 * // to get latest comments first
	 * Post.orderBy([ "comments", "id" ], "desc" );
	 * // or shortly
	 * Post.orderBy( "comments.id" );
	 * ```
	 * 
	 * ### Using All Kind Of Ordering By One Method Call With Object Syntax
	 * ```js
	 * Post.orderBy(
	 * {
	 *     id: "asc",
	 *     created_at: "desc",
	 *     "comments.id": "desc"
	 *     [ relation + "." + field ]: "desc",
	 * });
	 * ```
	 */
	static orderBy( fieldNameOrObject: string | object, mode: "asc"|"desc" = "asc" ): QueryBuilder
	{
		return this.createBuilder().orderBy( fieldNameOrObject, mode );
	}

	/**
	 * Creates a QueryBuilder instance, sets related resource
	 * names that should be exists in the returned resource and
	 * returns the QueryBuilder.
	 * 
	 * --------------------------------------------------------
	 * 
	 * @param resources resource names related with current resource
	 * @example
	 * ```js
	 * Post.with( "author", "comments", "likes" );
	 * // or
	 * Post.with([ "author", "comments" ]);
	 * ```
	 */
	static with( ...resources: string[]): QueryBuilder
	{
		return this.createBuilder().with( ...resources );
	}

	/**
	 * Creates a QueryBuilder instance, sets the current
	 * page number and returns the QueryBuilder.
	 * 
	 * @param page numeric 1 base page number
	 */
	static page( page: number ): QueryBuilder
	{
		return this.createBuilder().page( page );
	}

	/**
	 * Creates a QueryBuilder instance, sets the
	 * limit and returns the QueryBuilder.
	 * 
	 * @param limit limit
	 */
	static limit( limit: number ): QueryBuilder
	{
		return this.createBuilder().limit( limit );
	}

	/**
	 * Creates a QueryBuilder instance, sets the
	 * additional params and returns the QueryBuilder.
	 * 
	 * @param payload an object that contains the additional params to pass
	 */
	static params( payload: object ): QueryBuilder
	{
		return this.createBuilder().params( payload );
	}

	/**
	 * It runs the given function when any given condition value
	 * is truthy. It injects QueryBuilder and condition values
	 * into the function respectively.
	 * 
	 * @param condition any boolean value
	 * @param handler condition handler callback
	 */
	static when( condition: boolean, handler: WhenHandler ): QueryBuilder
	{
		return this.createBuilder().when( condition, handler );
	}

	/**
	 * Sets page number and limit null and sends
	 * a request to retrieve all resources.
	 */
	static all(): Promise<Collection<Model>>
	{
		return this.createBuilder().all();
	}

	/**
	 * Creates a QueryBuilder instance, build the query and sends
	 * a GET request to the API and returns a Promise.
	 * 
	 * When the request receive a successful response, received
	 * resource will converted a Model or Collection and Promise
	 * will resolved with it.
	 */
	static get(): Promise<Model | Collection<Model> | AxiosError>
	{
		return this.createBuilder().get();
	}

	/**
	 * It functions similarly to the `get` method, but it only
	 * returns the resource as a plain object.
	 */
	static $get(): Promise<{}>
	{
		return this.createBuilder().$get();
	}

	/**
	 * It functions similarly to the `$get` method, but it
	 * only returns the response object.
	 */
	static $$get(): Promise<AxiosResponse|AxiosError>
	{
		return this.createBuilder().$$get();
	}

	/**
	 * Sends the given payload with `PUT` method to the represented
	 * resource.
	 * 
	 * Since it's a static method, when called, it should be invoked
	 * with the primary key value of the resource as it might not
	 * be known yet.
	 * 
	 * #### Example Usage
	 * ```js
	 * Post.put(101, { foo: "bar" });
	 * ```
	 * 
	 * @param primaryKeyValue a primary key value
	 * @param payload params to be sent to the resource
	 */
	static put(
		primaryKeyValue: string | number | object,
		payload: object
	): Promise<RestormResponse | AxiosError>
	{
		const query = this.createBuilder();

		return query.request(() =>
			query.client.put( primaryKeyValue, payload )
		);
	}

	/**
	 * Sends the given payload with `PATCH` request to the represented
	 * model's resource.
	 * 
	 * Since it's a static method, when called, it should be invoked
	 * with the primary key value of the resource as it might not be
	 * known yet.
	 * 
	 * #### Example Usage
	 * ```js
	 * Post.patch(101, { foo: "bar" });
	 * ```
	 * 
	 * @param primaryKeyValue a primary key value
	 * @param payload params to be sent to the resource
	 */
	static patch(
		primaryKeyValue: string | number,
		payload: {}
	): Promise<RestormResponse | AxiosError>
	{
		const query = this.createBuilder();

		return query.request({
			action: () => query.client.patch({
				url: query.getResource( primaryKeyValue ),
				payload
			}),

			after: ( queryBuilder ) => queryBuilder.modelInstance.clean( payload)
		});
	}

	/**
	 * Sets the current query to get the first element of the first
	 * page. Performs the query and returns the first model received.
	 */
	static first(): Promise<Model>
	{
		return this.createBuilder().first();
	}

	/**
	 * Requests the resource with the given primary value located
	 * at the represented resource endpoint.
	 * 
	 * @param primary 
	 */
	static find( primary: string|number ): Promise<Model>
	{
		return this.createBuilder().find( primary );
	}

	/**
	 * Returns length aware paginator interface for represented .
	 * 
	 * @param startPage start page
	 */
	static paginate<T extends Model = Model>( startPage?: number ): LengthAwarePaginator<T>
	{
		return this.createBuilder().paginate( startPage ) as LengthAwarePaginator<T>;
	}

	/**
	 * Sets represented model's endpoint to a temporary value.
	 * 
	 * @param {function|(string|Model)[]} resources temporary resource
	 * @return {QueryBuilder}
	 */
	static from( ...resources )
	{
		return this.createBuilder().from( ...resources );
	}

	/**
	 * @typedef EventListenerOptions
	 * @type {object}
	 * @property {boolean=} append true for append, false for replace mode
	 * @property {boolean=} once true for run the event once or false for
	 * keep it persistent
	 */
	/**
	 * Registers a new event listener.
	 * 
	 * @param evtName event name
	 * @param handler event handler
	 * @param options options
	 */
	static on<K extends keyof EventMap>(
		evtName: K,
		handler: EventMap[K],
		{ append = true, once = false }: EventListenerOptions = {}
	): QueryBuilder
	{
		return this
			.createBuilder()
			.on( evtName, handler, { append, once });
	}

	/**
	 * It stores a method that will perform cast operations on a
	 * given field of the resource.
	 * 
	 * When each get request is completed, the stored methods are
	 * executed by taking the field values they are associated with.
	 * 
	 * @param fieldNameOrFieldsObj field name or fields object
	 * @param castHandle cast implementer
	 * @param payload additional arguments to push cast implementer's arguments
	 */
	static cast(
		fieldNameOrFieldsObj: string|CastHandler,
		castHandle: Function,
		payload: [] = []
	): QueryBuilder
	{
		return this.createBuilder().cast( fieldNameOrFieldsObj, castHandle, payload );
	}

	/**
	 * It receives a plain object representing a resource object
	 * and should extract the resource from it and return it.
	 * 
	 * Specific models should override this method to ensure that
	 * their scenarios are applied to obtain the actual resource
	 * from the response data.
	 * 
	 * @param responseBody a plain object representing a resource
	 * or resource collection
	 */
	static $pluck( responseBody: {}): {}
	{
		return responseBody;
	}

	/**
	 * Alias of {@link $pluck}.
	 */
	$pluck( responseBody: {}): {}
	{
		return Model.$pluck( responseBody );
	}

	/**
	 * It receives a plain object representing a resource and pagination
	 * metadata and should extract the metadata from it and return it.
	 * 
	 * Specific models should override this method to ensure that
	 * their scenarios are applied to obtain the actual resource
	 * from the response data.
	 * 
	 * @param page pagination metadata
	 * @param responseBody a plain object holds a resource and pagination metadata
	 */
	static $pluckPaginations( _page: Page, responseBody: {}): {}
	{
		return responseBody;
	}

	/**
	 * Creates and returns a QueryBuilder instance.
	 * 
	 * @param modelInstance 
	 */
	static createBuilder( modelInstance: Model = null ): QueryBuilder
	{
		const builder = new QueryBuilder( this, modelInstance );
		const methods = this.getInheritedMethods();

		Object.keys( methods ).forEach( name =>
		{
			const method = methods[ name ];

			if( name.startsWith( "on" ))
			{
				builder.on(
					camelToDash( name.slice( 2 )) as keyof EventMap,
					method
				);
			}
			else
			{
				if( ! ( name in builder ))
				{
					builder[ name ] = method;
				}
			}
		});
	
		return builder;
	}

	/**
	 * Returns an object containing the names of all static methods
	 * on the model and the methods themselves.
	 */
	static getInheritedMethods(): {}
	{
		const staticMethods = {}
		const ignoredMethods = [ "name", "prototype", "constructor", "length" ];
		let current = this;

		do
		{
			if( current === Model )
			{
				break;
			}

			Object
				.getOwnPropertyNames( current )
				.filter( name =>
					! ignoredMethods.includes( name ) && this[ name ] instanceof Function
				)
				.forEach( name =>
				{
					if( ! ( name in staticMethods ))
					{
						staticMethods[ name ] = current[ name ];
					}
				});
		}
		while( current = Object.getPrototypeOf( current ));

		return staticMethods;
	}

	/**
	 * Initializes model with data and casting map.
	 * 
	 * @param properties original properties
	 * @param casts casting map
	 */
	init( properties: object, casts: CastHandler ): Model
	{
		this.original = { ...this.original, ...properties }
		this.applyCasts( casts );
		
		return this;
	}

	/**
	 * Copies the given model's original properties to the current model.
	 * 
	 * @param model the model to be assimilated
	 */
	assimilateTo( model: Model ): Model
	{
		this.original = model.original;
		return this;
	}

	/**
	 * Sends the given payload or the represented model with `POST`
	 * request to the represented model's resource endpoint.
	 * 
	 * @param payload data object to be sent to the api endpoint
	 * @throws {Error} when the model has a primary key
	 */
	async post( payload?: object ): Promise<AxiosError|Model>
	{
		if( this.primary || payload?.[( this.constructor as typeof Model ).primaryKey ])
		{
			throw new Error( "Cannot call post() on a model with a primary key" );
		}

		const { query } = this;

		const result = await query.request(() =>
			query.client.post( payload || { ...this.original, ...this.modified })
		);

		if( result instanceof AxiosError )
		{
			return result;
		}

		if( result.hydrated instanceof Collection )
		{
			return result.hydrated.first();
		}

		return result.hydrated;
	}

	/**
	 * Sends the given payload with `PUT` request to the represented
	 * model's resource.
	 * 
	 * #### Example Usage
	 * ```js
	 * const post = await Post.find( 101 );
	 * post.put({ foo: "bar" });
	 * ```
	 * 
	 * @param payload params to be sent to the resource
	 */
	put( payload: object ): Promise<RestormResponse|AxiosError>
	{
		const { query } = this;

		return query.request(() =>
			query.client.put( payload )
		);
	}

	/**
	 * Sends the given payload with `PATCH` request to the represented
	 * model's resource.
	 * 
	 * #### Example Usage
	 * ```js
	 * const post = await Post.find( 101 );
	 * 
	 * post.foo = "bar";
	 * post.moo = "zoo";
	 * post.patch();
	 * 
	 * // or shortly
	 * 
	 * post.patch(
	 * {
	 *     foo: "bar",
	 *     moo: "zoo"
	 * });
	 * ```
	 * 
	 * @param payload params to be sent to the resource
	 */
	patch( payload: object ): Promise<RestormResponse|AxiosError>
	{
		const { query } = this;

		return query.request(
		{
			action: () => query.client.patch({
				url: query.getResource( this.primary ),
				payload: payload || this.modified
			}),

			after: () => this.clean( payload || this.modified )
		});
	}

	/**
	 * It checks whether the given field name is in the original data.
	 * 
	 * @param key name of the field to check
	 */
	has( key: string | number | symbol ): boolean
	{
		return key in this.original;
	}

	/**
	 * Registers a new event listener.
	 * 
	 * @param evtName event name
	 * @param handler event handler
	 * @param {eventListenerOptions} options options
	 */
	on<K extends keyof EventMap>(
		evtName: K,
		handler: EventMap[K],
		{ append = true, once = false }: EventListenerOptions = {}
	): QueryBuilder
	{
		return this.query.on( evtName, handler, { append, once });
	}

	/**
	 * Removes the specified event handler from the events list.
	 *
	 * @param evtName the name of the event
	 * @param handler the handler function to be removed
	 */
	off( evtName: string, handler: Function ): QueryBuilder
	{
		return this.query.off( evtName, handler );
	}

	/**
	 * It stores a method that will perform cast operations on a
	 * given field of the resource.
	 * 
	 * When each get request is completed, the stored methods are
	 * executed by taking the field values they are associated with.
	 * 
	 * @param fieldNameOrFieldsObj field name or fields object
	 * @param castHandle cast implementer
	 * @param payload additional arguments to push cast implementer's arguments
	 */
	cast(
		fieldNameOrFieldsObj: string | CastHandler,
		castHandle: Function,
		payload: [] = []
	): QueryBuilder
	{
		return this.query.cast( fieldNameOrFieldsObj, castHandle, payload );
	}

	/**
	 * Runs handlers from the given cast stack on the represented
	 * resource data.
	 * 
	 * @param casts \{field: handler\} for casting
	 */
	private applyCasts( casts: CastHandler ): void
	{
		for( const key in casts )
		{
			const cast = casts[ key ];
			let handle: Function, payload: [];

			if( typeof cast == "function" )
			{
				handle = cast;
				payload = [];
			}
			else
			{
				handle = cast.handle;
				payload = cast.payload || [];
			}

			this.original[ key ] = handle(
				this.original[ key ],
				this.original,
				...payload
			);
		}
	}

	/**
	 * Returns the JSON encoded version of the represented model.
	 */
	toJson(): string
	{
		return JSON.stringify( this.original );
	}

	/**
	 * Moves changed field values over original values.
	 * 
	 * @param payload an object that contains the changed field values
	 */
	clean( payload: object ): void
	{
		for( const key in payload )
		{
			this.original[ key ] = payload[ key ];

			delete payload[ key ];
		}

		this.isDirty = false;
	}
}

/**
 * A method that receive query builder instance
 * and original condition from arguments tunnel.
 * 
 * @param queryBuilder QueryBuilder instance
 * @param condition condition value to passed through the when method
 */
type WhenHandler = ( queryBuilder: QueryBuilder, condition: any ) => void

/**
 * A map of cast handlers.
 * 
 * @example
 * ```js
 * {
 *     date: ( value, originalData ) => new Date( value )
 * }
 * // or
 * {
 * 	   date:
 * 	   {
 *         payload: [ "foo" ],
 *         handle: ( value, originalData, payload_1: "foo" ) => new Date( value )
 *     }
 * }
 * ```
 */
export type CastHandler = Record<string, Function|{handle:Function,payload:[]}>
