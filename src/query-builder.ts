import type { CastHandler } from "./model";
import { symOnce } from "./utils/symbols";
import { type AxiosResponse, AxiosError } from "axios";
import { flatObject, isPlainObject } from "./utils";
import { Field, Value, Client, Collection, LengthAwarePaginator, Model, Operator } from ".";

/**
 * Restorm query builder.
 */
export default class QueryBuilder
{
	/**
	 * Underlying model's class.
	 */
	model: typeof Model;

	/**
	 * Underlying client instance.
	 */
	client: Client;

	/**
	 * Order bys.
	 */
	orderBys: [Field, "asc"|"desc"][] = [];

	/**
	 * Wheres.
	 */
	wheres: Array<[Field, Value, Operator]> = [];

	/**
	 * Relations.
	 */
	withs: string[]|Value = [];

	/**
	 * Selected fields.
	 */
	selects: Array<[Field, Value]> = [];

	/**
	 * Page number.
	 */
	currentPage: null|number|string = null;

	/**
	 * Limit.
	 */
	currentLimit: null|number|string = 10;

	/**
	 * Additional params.
	 */
	additionalParams: {} = {}

	/**
	 * Temporary resource endpoint.
	 */
	resource: null|string = null;

	/**
	 * Event listeners.
	 */
	events: {[ key: string ]: Set<any> } = {}

	/**
	 * Casting map.
	 */
	casts: CastHandler = {}

	/**
	 * Model instance.
	 */
	modelInstance: Model;

	/**
	 * Instantiates model.
	 * 
	 * @param model model constructor
	 * @param modelInstance model instance
	 */
	constructor( model: typeof Model, modelInstance: Model )
	{
		this.model = model;
		this.modelInstance = modelInstance;
		this.client = new Client( this );

		const itemsPerPage = model.itemsPerPage;

		if( itemsPerPage )
		{
			this.currentLimit = itemsPerPage;
		}
	}

	/**
	 * Resets the builder except events, casts etc.
	 */
	reset(): QueryBuilder
	{
		const cleanInstance = new QueryBuilder( this.model, this.modelInstance );

		const targets =
		[
			"orderBys", "wheres", "withs", "selects",
			"currentPage", "currentLimit", "additionalParams",
		];

		for( const target of targets )
		{
			this[ target ] = cleanInstance[ target ];
		}

		return this;
	}

	/**
	 * It sets the field names that are desired to be included
	 * in the represented resource.
	 * 
	 * ### Selecting Resource Fields
	 * ```js
	 * Post.select([ "id", "title", "author_id" ]);
	 * ```
	 * ### Selecting Related Resource Fields
	 * ```js
	 * Post.select( "comments", [ "id", "post_id", "author", "comment" ]);
	 * Post.select( "comments.reactions", [ "comment_id", "reaction" ]);
	 * ```
	 * ### Object Syntax
	 * ```js
	 * Post.select(
	 * {
	 *     // resource fields
	 *     "": [ "id", "title", "author_id" ],
	 *     // related resource fields
	 *     comments: [ "id", "post_id", "author", "comment" ],
	 *     // deeply related resource fields
	 *     "comments.reactions": [ "comment_id", "reaction" ]
	 * })
	 * ```
	 * 
	 * @param nameOrArrayOrObject name, names array or name map
	 * @param fields fields list 
	 */
	select( nameOrArrayOrObject: string | string[] | object, fields = []): QueryBuilder
	{
		const args = Array.prototype.slice.call( arguments );

		if( args.length === 1 )
		{
			if( args[ 0 ] instanceof Array )
			{
				this.selects.push(
				[
					new Field( "" ),
					new Value( args[ 0 ])
				]);
			}
			else if( isPlainObject( args[ 0 ]))
			{
				flatObject( args[ 0 ])
					.forEach( item =>
						this.selects.push(
						[
							new Field( item.key ),
							new Value( item.value )
						])
					);
			}
		}
		else if( args.length === 2 )
		{
			if( typeof( args[ 0 ]) == "string" && args[ 1 ] instanceof Array )
			{
				this.selects.push(
				[
					new Field( args[ 0 ]),
					new Value( args[ 1 ])
				]);
			}
		}

		return this;
	}

	/**
	 * It adds a where constraint directly to the query.
	 * 
	 * @param field static field name
	 * @param value field value
	 * @example
	 * Post.where( "state", "approved" );
	 */
	where( field: string, value: WhereCondition ): QueryBuilder;
	/**
	 * It adds a where constraint directly to the query with an operator.
	 * 
	 * @param field static field name
	 * @param operator operator
	 * @param value field value
	 * @example
	 * Post.where( "state", "equal", "approved" );
	 */
	where( field: string, operator: WhereOperators, value: WhereCondition ): QueryBuilder;
	/**
	 * It adds a where constraint directly to the related resource.
	 * 
	 * @param relatedFields related resource field names
	 * @param value field value
	 * @example
	 * Post.where([ "comments", "user" ], "admin" );
	 */
	where( relatedFields: string[], value: WhereCondition ): QueryBuilder;
	/**
	 * It adds a where constraint directly to the related resource with an operator.
	 * 
	 * @param relatedFields related resource field names
	 * @param operator operator
	 * @param value field value
	 */
	where( relatedFields: string[], operator: WhereOperators, value: WhereCondition ): QueryBuilder;
	/**
	 * It adds a where constraint by using an object.
	 * 
	 * @param fieldMap where map
	 * @example
	 * Post.where(
	 * {
	 *     state: "approved",
	 *     type: "article",
	 *     "comments.state": "approved"
	 *     // or
	 *     [ relationName + "." + fieldName ]: "approved",
	 *     // or
	 *     comments:
	 *     {
	 *         state: "approved"
	 *     },
	 * });
	 */
	where( fieldMap: object ): QueryBuilder;
	// where( fieldNameOrWhereMap: any, operatorOrValue: any, value: any ): QueryBuilder
	where(
		fieldNameOrWhereMap: string | string[] | object,
		operatorOrValue?: WhereOperators & WhereCondition,
		value?: WhereCondition
	): QueryBuilder
	{
		if( arguments.length === 2 )
		{
			value = operatorOrValue;
			operatorOrValue = Array.isArray( value )
				? "in"
				: "equal";
		}
		
		if( isPlainObject( fieldNameOrWhereMap ))
		{
			flatObject( fieldNameOrWhereMap )
				.forEach( item =>
					// this.where( item.key, operatorOrValue, item.value )
					this.where( item.key, operatorOrValue, item.value )
				);
		}
		else
		{
			this.wheres.push(
			[
				new Field( fieldNameOrWhereMap as string|string[]),
				new Value( value ),
				new Operator( operatorOrValue )
			]);
		}

		return this;
	}

	/**
	 * Adds a where clause to the query builder that checks if a
	 * field is null.
	 *
	 * @param fieldNameOrWhereMap the name of the field to check for null
	 */
	whereNull( fieldNameOrWhereMap: FieldArg ): QueryBuilder
	{
		return this.where( fieldNameOrWhereMap as any, "null", null );
	}

	/**
	 * Adds a where clause to the query builder that checks if a
	 * field is not null.
	 *
	 * @param fieldNameOrWhereMap the name of the field to check for not null
	 */
	whereNotNull( fieldNameOrWhereMap: FieldArg ): QueryBuilder
	{
		return this.where( fieldNameOrWhereMap as any, "notnull", null );
	}

	/**
	 * Adds a where clause to the query builder that checks if a
	 * field is between two values.
	 *
	 * @param fieldNameOrWhereMap name of field to check
	 * @param range minimum and maximum value
	 * @param not whether to negate the condition
	 */
	whereBetween(
		fieldNameOrWhereMap: FieldArg,
		range: null|number[] = null,
		not: boolean = false
	): QueryBuilder
	{
		return this.where(
			fieldNameOrWhereMap as any,
			not? "notbetween" : "between",
			( range || [])?.slice( 0, 2 )
		);
	}

	/**
	 * Adds a rule to exclude resources that fall within a specified range.
	 *
	 * @param fieldNameOrWhereMap name of the field to check
	 * @param range minimum and maximum value
	 */
	whereNotBetween( fieldNameOrWhereMap: FieldArg, range: number[]): QueryBuilder
	{
		return this.whereBetween( fieldNameOrWhereMap, range, true );
	}

	/**
	 * Adds a where clause to the query builder that checks if a field is
	 * in a list of values.
	 *
	 * @param fieldNameOrWhereMap name of the field to check
	 * @param values list of values to check against
	 */
	whereIn( fieldNameOrWhereMap: FieldArg, values: []): QueryBuilder 
	{
		return this.where( fieldNameOrWhereMap as any, "in", values );
	}

	/**
	 * Adds a where clause to the query builder that checks if a field is
	 * not in a list of values.
	 *
	 * @param fieldNameOrWhereMap name of the field to check
	 * @param values list of values to check against
	 */
	whereNotIn( fieldNameOrWhereMap: FieldArg, values: []): QueryBuilder
	{
		return this.where( fieldNameOrWhereMap as any, "notin", values );
	}

	/**
	 * Adds rules to be used to sort resources.
	 * 
	 * ### Sorting Resource
	 * ```js
	 * Post.orderBy( "updated_at", "desc" ).orderBy( "created_at" );
	 * ```
	 * ### Sorting Related Resources
	 * ```js
	 * Post.orderBy( "comments.id", "desc" );
	 * // or
	 * Post.orderBy([ "comments", "id" ], "desc" );
	 * ```
	 * ### Object Syntax
	 * ```js
	 * Post.orderBy(
	 * {
	 *    updated_at: "desc",
	 *    created_at: "asc",
	 *    "comments.id": "desc",
	 *    [ relationName + "." + fieldName ]: "desc",
	 *    // or
	 *    comments:
	 *    {
	 *       id: "desc"
	 *    }
	 * });
	 * ```
	 * 
	 * @param fieldNameOrOrderByMap field name or orderBy map
	 * @param mode sorting direction
	 */
	orderBy(
		fieldNameOrOrderByMap: FieldArg,
		mode: "asc"|"desc" = "asc"
	): QueryBuilder
	{
		if( isPlainObject( fieldNameOrOrderByMap ))
		{
			flatObject( fieldNameOrOrderByMap ).forEach( item =>
				this.orderBy(
					item.key,
					item.value as "asc"|"desc"
				)
			);
		}
		else
		{
			this.orderBys.push(
			[
				new Field( fieldNameOrOrderByMap as string|string[]),
				mode
			]);
		}

		return this;
	}

	/**
	 * Sets the related resources that must be added to the resources.
	 * 
	 * @param resources related resource names
	 */
	with( ...resources: string[]): QueryBuilder
	{
		this.withs = new Value( resources );

		return this;
	}

	/**
	 * Sets current page number.
	 * 
	 * @param page page number
	 */
	page( page: number | string | null ): QueryBuilder
	{
		this.currentPage = page;
		return this;
	}

	/**
	 * Sets current limit.
	 * 
	 * @param limit item limit
	 */
	limit( limit: null | number | string ): QueryBuilder
	{
		this.currentLimit = limit;
		return this;
	}

	/**
	 * Sets given additional params.
	 * 
	 * ```js
	 * Post.params({ scenario: "most-viewed" }).get();
	 * // GET api/posts?scenario=most-viewed
	 * ```
	 * 
	 * @param payload additional params
	 */
	params( payload: {}): QueryBuilder
	{
		flatObject( payload ).forEach( item =>
		{
			const keys = item.key.split( "." );
			const name =
				keys.shift() +
				keys.map( key => `[${ key }]` ).join( "" );

			this.additionalParams[ name ] = item.value;
		});

		return this;
	}

	/**
	 * It runs the given function when any given condition value
	 * is truthy. It injects QueryBuilder and condition values
	 * into the function respectively.
	 * 
	 * @param condition a value that can be evaluated as a boolean
	 * @param handler 
	 */
	when( condition: boolean, handler: WhenHandler ): QueryBuilder
	{
		if( condition )
		{
			handler( this, condition );
		}
		
		return this;
	}

	/**
	 * Tries to fetch all elements in the represented equity.
	 * 
	 * If it finds no items, it returns an empty collection.
	 */
	async all(): Promise<Collection<Model>>
	{
		const result = await this.get();

		if( result instanceof Model )
		{
			return new Collection( result );
		}
		else if( result instanceof Collection )
		{
			return result;
		}

		return new Collection;
	}

	/**
	 * It compiles the current query, sends a request to the API with 
	 * the `GET` method and returns a promise.
	 * 
	 * When the response is received, it instantiates the results as a 
	 * model or collection and fullfills the returned promise.
	 */
	async get(): Promise<Model | Collection<Model> | AxiosError>
	{
		const result = await this.request(
		{
			action: () => this.client.get(),
			hydrate: response => this.hydrate( response )
		});

		return result instanceof AxiosError
			? result
			: result.hydrated as Model | Collection<Model>;
	}

	/**
	 * It functions similarly to the `get` method, but it only
	 * resolves the resource as a plain object.
	 */
	async $get(): Promise<{}>
	{
		const result = await this.request(() =>
			this.client.get()
		);

		if( result instanceof AxiosError )
		{
			return {}
		}

		return result.data;
	}

	/**
	 * It functions similarly to the `$get` method, but it only
	 * returns the response object.
	 */
	async $$get(): Promise<AxiosResponse|AxiosError>
	{
		const result = await this.request(() =>
			this.client.get()
		);

		if( result instanceof AxiosError )
		{
			return result;
		}

		return result.response;
	}

	/**
	 * Sends the given payload with `PUT` request to the represented
	 * model's endpoint.
	 * 
	 * @param targetPrimaryKeyValueOrPayload a primary key value or a plain object as payload
	 * @param payload optionally payload 
	 */
	async put(
		targetPrimaryKeyValueOrPayload: string | number | object,
		payload?: {}
	): Promise<Model|Collection<Model>|AxiosError|undefined>
	{
		const result = await this.request(
		{
			action: () => this.client.put( targetPrimaryKeyValueOrPayload, payload ),
			hydrate: response => this.hydrate( response )
		});

		if( result instanceof AxiosError )
		{
			return result;
		}

		if( result.hydrated )
		{
			return result.hydrated;
		}
	}

	/**
	 * Sends the given payload with `PATCH` method to the represented
	 * model's resource endpoint.
	 * 
	 * #### Example Usage
	 * ```js
	 * Post.patch({ foo: "bar" });
	 * ```
	 * 
	 * @param primaryKeyValue a primary key value
	 * or a plain object as payload
	 * @param payload params to be sent to the resource
	 */
	async patch(
		primaryKeyValue: string | number | object,
		payload: {}
	): Promise<Model|Collection<Model>|AxiosError|undefined>
	{
		const result = await this.request(
		{
			action: () => this.client.patch( payload ),
			hydrate: response => this.hydrate( response ),
			after: () => this.modelInstance.clean( payload )
		});

		if( result instanceof AxiosError )
		{
			return result;
		}

		return result.hydrated;
	}

	/**
	 * Makes requests, triggers events, runs hooks, converts received
	 * resource to a Model or Collection, and resolves with it.
	 * 
	 * @param hooks lifecycle methods
	 * @emits QueryBuilder#waiting
	 */
	async request(
		hooks: RequestLifecycleHooks | ActionHook = {}
	): Promise<RestormResponse|AxiosError>
	{
		let action: ActionHook | undefined;
		let hydrate: HydrateHook | undefined;
		let after: AfterHook | undefined;

		if( typeof hooks === "function" )
		{
			action = hooks;
		}
		else if( typeof hooks === "object" && hooks !== null )
		{
			action = hooks.action;
			hydrate = hooks.hydrate;
			after = hooks.after;
		}

		this.trigger( "waiting", [ this ]);

		try
		{
			if( ! action )
			{
				throw new Error( "No action provided to request()" );
			}

			return this.handleResponse( await action( this ), hydrate, after );
		}
		catch( err )
		{
			return this.handleErrors( err, after );
		}
	}

	/**
	 * It handles the response and triggers the appropriate events.
	 * 
	 * @param response response object
	 * @param hydrate hydrate hook
	 * @param after method to be run after receiving response
	 * @emits QueryBuilder#[StatusCode]
	 * @emits QueryBuilder#success
	 * @emits QueryBuilder#finished
	 */
	handleResponse(
		response: AxiosResponse,
		hydrate?: HydrateHook,
		after?: AfterHook
	): RestormResponse
	{
 		const args: RestormResponse = { hydrated: undefined, response, data: {}}
 		const events = [ response.status, "success", "finished" ];

 		if( hydrate )
 		{
 			args.hydrated = hydrate( response );
 		}

 		if( after )
 		{
 			after( this );
 		}

 		args.data = this.model.$pluck( response.data );

 		this.trigger( events, Object.values( args ));

 		return args;
	}

	/**
	 * It handles the errors and triggers the appropriate events.
	 * 
	 * @param err error object
	 * @param after method to be run after receiving response
	 * @throws {Error}
	 * @emits QueryBuilder#failed
	 * @emits QueryBuilder#network-error
	 * @emits QueryBuilder#finished
	 */
	handleErrors( err: Error|AxiosError, after?: AfterHook ): AxiosError
	{
		const args: any[] = [];
		const events: (string|number)[] = [];

		if( after )
		{
			after( this );
		}

		if( err instanceof AxiosError )
		{
			args.push( err );

			if( err.code == "ERR_NETWORK" )
			{
				events.push( "network-error" );
			}
			else if( err.code == "ERR_BAD_REQUEST" )
			{
				events.push( "client-bad-request", err.message );
			}
			else
			{
				if( err.response )
				{
					events.push( err.response.status );
				}
			}

			events.push( "failed", "finished" );

			this.trigger( events, args );

			return err;
		}

		throw err;
	}

	/**
	 * Sets the current query to get the first element of the first
	 * page. Performs the query and returns the first model received.
	 */
	async first(): Promise<Model>
	{
		const result = await this.page( 1 ).limit( 1 ).get();

		if( result instanceof Model )
		{
			return result;
		}
		else if( result instanceof Collection )
		{
			return result.first();
		}
	}

	/**
	 * Requests the resource with the given primary value located
	 * at the represented resource endpoint.
	 * 
	 * @param primary 
	 */
	async find( primary: string | number ): Promise<Model>
	{
		// save current resource endpoint
		const resource = this.resource;

		const result = await this
			.from( this.model.resource + "/" + primary )
			.page( null )
			.limit( null )
			.get();

		// we should restore latest resource
		this.resource = resource;

		if( result instanceof Model )
		{
			return result;
		}
		else if( result instanceof Collection )
		{
			return result.first();
		}
	}

	/**
	 * Converts current query to length aware paginator interface.
	 * 
	 * @param startPage start page
	 */
	paginate<T extends Model = Model>( startPage?: number ): LengthAwarePaginator<T>
	{
		return new LengthAwarePaginator<T>( this, startPage );
	}

	/**
	 * Sets represented model's endpoint to a temporary value.
	 * 
	 * @param resources temporary resource
	 */
	from( resource: string ): QueryBuilder;
	from( resourceModifier: ( resource: string ) => string ): QueryBuilder;
	from( ...mixedResources: (string|number|Model)[]): QueryBuilder;
	from( ...resources: any[]): QueryBuilder
	{
		if( resources.length == 1 )
		{
			// dynamic determination of resource by function
			if( resources[ 0 ] instanceof Function )
			{
				this.resource = resources[ 0 ]( this.getResource());
				return this;
			}

			if( typeof resources[ 0 ] == "string" )
			{
				this.resource = resources[ 0 ];
				return this;
			}
	
			// dynamic determination of resource by object
			if( isPlainObject( resources[ 0 ]))
			{
				let resource = this.getResource();

				for( const target in resources[ 0 ])
				{
					resource = resource.replace(
						"{" + target + "}",
						resources[ 0 ][ target ] as string
					);
				}

				this.resource = resource;
				return this;
			}
		}
		else if( resources.length > 1 )
		{
			const endpoint: string[] = [];
	
			for( const item of resources as (string|number|Model)[])
			{
				if( item instanceof Model )
				{
					endpoint.push(
						( item.constructor as typeof Model ).resource,
						item.primary
					);
				}
				else
				{
					endpoint.push( item.toString());
				}
			}
	
			this.resource = endpoint
				// we should remove empty elements
				.filter( i => i )
				.join( "/" );
	
		}
		
		return this;
	}

	/**
	 * Returns a resource endpoint value for the represented
	 * model, including the one temporarily assigned by the
	 * `QueryBuilder.resource` method.
	 * 
	 * @param append appended value
	 */
	getResource( append?: string | number ): string
	{
		return ( this.resource || this.model.resource ) + ( append? "/" + append : "" );
	}

	/**
	 * Registers a new event listener.
	 * 
	 * @param evtName event name
	 * @param handler event handler
	 * @param options options
	 */
	on<K extends keyof EventMap>(
		evtName: K,
		handler: EventMap[K],
		{ append = true, once = false }: EventListenerOptions = {}
	): QueryBuilder
	{
		if( ! ( evtName in this.events ))
		{
			this.events[ evtName ] = new Set;
		}

		handler[ symOnce ] = once;

		if( append )
		{
			this.events[ evtName ].add( handler );
		}
		else
		{
			this.events[ evtName ].clear();
			this.events[ evtName ].add( handler );
		}

		return this;
	}

	/**
	 * Removes the specified event handler from the events list.
	 *
	 * @param evtName the name of the event
	 * @param handler the handler function to be removed
	 */
	off( evtName: string, handler: Function ): QueryBuilder
	{
		if( ! ( evtName in this.events ))
		{
			return this;
		}

		this.events[ evtName ].delete( handler );

		return this;
	}

	/**
	 * It executes all event listener methods registered for the
	 * given named event by passing the given argument list.
	 * 
	 * @param evtNames event name(s)
	 * @param args arguments to pass event listener
	 */
	trigger(
		evtNames: string | number | (string | number)[],
		args: any[] = []
	): QueryBuilder|void
	{
		if( Array.isArray( evtNames ))
		{
			return evtNames.forEach( evt =>
				this.trigger( evt, args )
			);
		}

		if( ! ( evtNames in this.events ))
		{
			return this;
		}

		this.events[ evtNames ].forEach( handler =>
		{
			handler.call( this, ...args );

			if( handler[ symOnce ])
			{
				this.events[ evtNames ].delete( handler );
			}
		});

		return this;
	}

	/**
	 * It stores a method that will perform cast operations on a
	 * given field of the resource.
	 * 
	 * When each get request is completed, the stored methods are
	 * executed by taking the field values they are associated with.
	 * 
	 * @param fieldNameOrFieldsObj field name or fields object
	 * @param castHandler cast implementer
	 * @param payload additional arguments to push cast implementer's arguments
	 */
	cast(
		fieldNameOrFieldsObj: string | CastHandler,
		castHandler: Function,
		payload: [] = []
	): QueryBuilder
	{
		if( arguments.length > 1 && typeof fieldNameOrFieldsObj == "string" )
		{
			this.casts[ fieldNameOrFieldsObj ] =
			{
				payload,
				handle: castHandler,
			}
		}
		else if( isPlainObject( fieldNameOrFieldsObj ))
		{
			Object.assign( this.casts, fieldNameOrFieldsObj );
		}

		return this;
	}

	/**
	 * If there is a request in progress, it stops it.
	 */
	cancel()
	{
		this.client.cancel();
	}

	/**
	 * Returns an object containing all created filters and criteria.
	 */
	compile(): CompiledQuery
	{
		return {
			...this.build( "filter", this.wheres ),
			...this.build( "sort", this.orderBys ),
			...this.build( "with", this.withs ),
			...this.build( "field", this.selects ),
			...this.additionalParams,
			limit: this.currentLimit,
			page: this.currentPage,
		}
	}

	/**
	 * Builds given items stack with given name.
	 * 
	 * @param name key name
	 * @param stack items to build
	 */
	private build( name: string, stack: any[] | Value ): {}
	{
		const map = {}

		if( stack instanceof Value )
		{
			stack = [ stack ];
		}

		stack.forEach( item =>
		{
			if( item instanceof Array && item[ 0 ] instanceof Field )
			{
				if( item[ 2 ] instanceof Operator )
				{
					map[ name + item[ 0 ]] = item[ 2 ] + ":" + item[ 1 ];
				}
				else
				{
					map[ name + item[ 0 ]] = item[ 1 ].toString();
				}
			}
			else
			{
				map[ name ] = item.toString();
			}
		});

		return map;
	}

	/**
	 * It takes the Response object, processes all the data and
	 * metadata information it carries, and returns either a model
	 * or a collection that containing models, depending on the returned
	 * data format.
	 * 
	 * @param response response object
	 */
	private hydrate( response: AxiosResponse ): Model|Collection<Model>
	{
		const data = this.model.$pluck( response.data );
		const casts = Object.assign(
			{},
			this.model.casts,
			this.casts
		);

		if( isPlainObject( data ))
		{
			if( this.modelInstance )
			{
				return this.modelInstance.init( data, casts );
			}

			return new this.model( data, casts );
		}
		else if( Array.isArray( data ))
		{
			return new Collection(
				...data.map( item =>
					new this.model( item, casts )
				)
			);
		}

		return new Collection;
	}

}

export type WhereCondition = null | string | number | string[] | number[];
export type FieldArg = string | string[] | {};
export type WhereOperators = "equal" | "notequal" | "less" | "greater" | "lesseq" | "greatereq" | "between" | "notbetween" | "in" | "notin" | "like" | "notlike" | "null" | "notnull";

/**
 * Restorm response.
 */
export interface RestormResponse
{
	/**
	 * The stripped version of the data returned from the
	 * server, instantiated as a model or collection.
	 */
	hydrated?: Model | Collection<Model>;
	
	/** Axios response. */
	response: AxiosResponse;

	/** Data part of the response that returned from the server. */
	data: object | {}[];
}

/**
 * Event listener options.
 */
export interface EventListenerOptions
{
	/** true for append, false for replace mode */
	append?: boolean;
	/** true for run the event once or false for keep it persistent */
	once?: boolean;
}

type SuccessStatus = 200 | 201 | 202 | 204; 
type ErrorStatus = 400 | 401 | 403 | 404 | 429 | 500;

export type EventMap = {
  success: SuccessEventHandler;
  waiting: BasicEventHandler;
  error: ErrorEventHandler;
  finished: FinishedEventHandler;
} & {
  [K in SuccessStatus]: SuccessEventHandler;
} & {
  [K in ErrorStatus]: ErrorEventHandler;
}

/**
 * Compiled query.
 */
interface CompiledQuery
{
	filter?: object;
	sort?: object;
	with?: object;
	field?: object;
	limit: number|string|null;
	page: number|string|null;
}

/**
 * Request lifecycle hooks.
 */
interface RequestLifecycleHooks {
	action?: ActionHook;
	hydrate?: HydrateHook;
	after?: AfterHook;
}

/**
 * @param query query builder instance
 * @param condition original condition to passed when method
 */
type WhenHandler = ( query: QueryBuilder, condition: any ) => void;

/**
 * @param response response object returned from restful endpoint
 * @return hydrated resource
*/
type HydrateHook = ( response: AxiosResponse ) => Model | Collection<Model>;
type AfterHook = ( queryBuilder: QueryBuilder ) => void;
type ActionHook = ( queryBuilder: QueryBuilder ) => Promise<AxiosResponse>;

/**
 * @param item - hydrated resource
 * @param response - response object
 * @param data - plucked response data
 */
type SuccessEventHandler = (
	item: Model | Collection<Model>,
	response: AxiosResponse, data: object | {}[]
) => void;

/**
 * @param itemOrError - hydrated resource or error
 * @param response - response object
 * @param data - plucked response data
 */
type FinishedEventHandler = (
	itemOrError: Model | Collection<Model> | AxiosError,
	response?: AxiosResponse,
	data?: object | {}[]
) => void;

type ErrorEventHandler = ( err: AxiosError ) => void;
type BasicEventHandler = ( queryBuilder: QueryBuilder ) => void;
