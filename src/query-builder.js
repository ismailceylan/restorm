import { symOnce } from "./utils/symbols";
import { flatObject, isPlainObject } from "./utils";
import { Field, Value, Client, Collection, LengthAwarePaginator, Model, Operator }
	from ".";

/**
 * @typedef {import('axios').AxiosResponse} AxiosResponse
 * @typedef {import('axios').AxiosError} AxiosError
 */
export default class QueryBuilder
{
	/**
	 * Underlying model's class.
	 * 
	 * @type {Model}
	 */
	model;

	/**
	 * Order bys.
	 * 
	 * @type {array}
	 */
	orderBys = [];

	/**
	 * Wheres.
	 * 
	 * @type {array[]}
	 */
	wheres = [];

	/**
	 * Relations.
	 * 
	 * @type {array}
	 */
	withs = [];

	/**
	 * Selected fields.
	 * 
	 * @type {array[]}
	 */
	selects = [];

	/**
	 * Page number.
	 * 
	 * @type {number}
	 */
	currentPage = null;

	/**
	 * Limit.
	 * 
	 * @type {number}
	 */
	currentLimit = 10;

	/**
	 * Additional params.
	 * 
	 * @type {object}
	 */
	additionalParams = {}

	/**
	 * Temporary resource endpoint.
	 * 
	 * @type {string}
	 */
	resource = null;

	/**
	 * Event listeners.
	 * 
	 * @type {object}
	 */
	events = {}

	/**
	 * Casting map.
	 * 
	 * @type {object}
	 */
	casts = {}

	/**
	 * Instantiates model.
	 * 
	 * @param {Model} Model model class
	 * @param {Model} modelInstance model instance
	 */
	constructor( Model, modelInstance )
	{
		this.model = Model;
		this.modelInstance = modelInstance;
		this.client = new Client( this );

		if( Model.itemsPerPage )
		{
			this.currentLimit = Model.itemsPerPage;
		}
	}

	/**
	 * Resets the builder except events, casts etc.
	 * 
	 * @return {QueryBuilder}
	 */
	reset()
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
	 * @param {string|array|object} nameOrArrayOrObject name, names
	 * array or name map
	 * @param {array} fields 
	 * @return {QueryBuilder}
	 */
	select( nameOrArrayOrObject, fields = [])
	{
		const args = [ ...arguments ];

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
				flatObject( args[ 0 ]).forEach( item =>
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
	 * @typedef {string|string[]} WhereCondition
	 * @typedef {string|string[]|{}} WhereTarget
	 * @typedef {"equal"|"notequal"|"less"|"greater"|"lesseq"|"greatereq"|"between"|"notbetween"|"in"|"notin"|"like"|"notlike"|"null"|"notnull"} WhereOperators
	 */

	/**
	 * Adds constraints to be used to filter resources.
	 * 
	 * ### Filtering Resource
	 * ```js
	 * Post
	 *    .where( "state", "approved" )
	 *    .where( "type", "article" );
	 * ```
	 * ### Filtering Related Resource
	 * ```js
	 * Post.where([ "comments", "state" ], "approved" );
	 * // or
	 * Post.where( "comments.state", "approved" );
	 * ```
	 * ### Object Syntax
	 * ```js
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
	 * ```
	 * @param {WhereTarget} fieldNameOrWhereMap field name or where map
	 * @param {WhereCondition & WhereOperators} operatorOrValue filtering operator or conditions
	 * @param {WhereCondition} condition conditions
	 * @return {QueryBuilder}
	 */
	where( fieldNameOrWhereMap, operatorOrValue, value )
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
			flatObject( fieldNameOrWhereMap ).forEach( item =>
				this.where(
					item.key,
					operatorOrValue,
					item.value
				)
			);
		}
		else
		{
			this.wheres.push(
			[
				new Field( fieldNameOrWhereMap ),
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
	 * @param {WhereTarget} fieldNameOrWhereMap the name of the field to check for null
	 * @return {QueryBuilder}
	 */
	whereNull( fieldNameOrWhereMap )
	{
		return this.where(
			fieldNameOrWhereMap,
			"null",
			null
		);
	}

	/**
	 * Adds a where clause to the query builder that checks if a
	 * field is not null.
	 *
	 * @param {WhereTarget} fieldNameOrWhereMap the name of the field to check for not null
	 * @return {QueryBuilder}
	 */
	whereNotNull( fieldNameOrWhereMap )
	{
		return this.where(
			fieldNameOrWhereMap,
			"notnull",
			null
		);
	}

	/**
	 * Adds a where clause to the query builder that checks if a
	 * field is between two values.
	 *
	 * @param {WhereTarget} fieldNameOrWhereMap name of field to check
	 * @param {number[]} range minimum and maximum value
	 * @param {boolean} [not=false] whether to negate the condition
	 * @return {QueryBuilder}
	 */
	whereBetween( fieldNameOrWhereMap, range = null, not = false )
	{
		return this.where(
			fieldNameOrWhereMap ,
			not? "notbetween" : "between",
			range?.slice( 0, 2 )
		);
	}

	/**
	 * Adds a rule to exclude resources that fall within a specified range.
	 *
	 * @param {WhereTarget} fieldNameOrWhereMap name of the field to check
	 * @param {number[]} range minimum and maximum value
	 * @return {QueryBuilder}
	 */
	whereNotBetween( fieldNameOrWhereMap, range )
	{
		return this.whereBetween( fieldNameOrWhereMap, range, true );
	}

	/**
	 * Adds a where clause to the query builder that checks if a field is
	 * in a list of values.
	 *
	 * @param {WhereTarget} fieldNameOrWhereMap name of the field to check
	 * @param {Array} values list of values to check against
	 * @return {QueryBuilder}
	 */
	whereIn( fieldNameOrWhereMap, values )
	{
		return this.where(
			fieldNameOrWhereMap,
			"in",
			values
		);
	}

	/**
	 * Adds a where clause to the query builder that checks if a field is
	 * not in a list of values.
	 *
	 * @param {WhereTarget} fieldNameOrWhereMap name of the field to check
	 * @param {Array} values list of values to check against
	 * @return {QueryBuilder}
	 */
	whereNotIn( fieldNameOrWhereMap, values )
	{
		return this.where(
			fieldNameOrWhereMap,
			"notin",
			values
		);
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
	 * @param {string|array|object} fieldNameOrOrderByMap field name or orderBy map
	 * @param {"asc"|"desc"} mode sorting direction
	 * @return {QueryBuilder}
	 */
	orderBy( fieldNameOrOrderByMap, mode = "asc" )
	{
		if( isPlainObject( fieldNameOrOrderByMap ))
		{
			flatObject( fieldNameOrOrderByMap ).forEach( item =>
				this.orderBy(
					item.key,
					item.value
				)
			);
		}
		else
		{
			this.orderBys.push(
			[
				new Field( fieldNameOrOrderByMap ),
				mode
			]);
		}

		return this;
	}

	/**
	 * Sets the related resources that must be added to the resources.
	 * 
	 * @param {...string} resources related resource names
	 * @return {QueryBuilder}
	 */
	with( ...resources )
	{
		this.withs = new Value( resources );

		return this;
	}

	/**
	 * Sets current page number.
	 * 
	 * @param {number|string} page page number
	 * @return {QueryBuilder}
	 */
	page( page )
	{
		this.currentPage = page;

		return this;
	}

	/**
	 * Sets current limit.
	 * 
	 * @param {number|string} limit item limit
	 * @return {QueryBuilder}
	 */
	limit( limit )
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
	 * @param {object} payload additional params
	 * @return {QueryBuilder}
	 */
	params( payload )
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
	 * @typedef whenHandler
	 * @type {function}
	 * @param {QueryBuilder} query query builder instance
	 * @param {*} condition original condition to passed when method
	 */
	/**
	 * 
	 * @param {boolean} condition a value that can be evaluated as a boolean
	 * @param {whenHandler} handler 
	 * @return {QueryBuilder}
	 */
	when( condition, handler )
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
	 * 
	 * @return {Promise<Collection>}
	 */
	async all()
	{
		const result = await this.get();

		if( result instanceof Model )
		{
			return new Collection( ...result );
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
	 * 
	 * @return {Promise<Model|Collection|AxiosError>}
	 */
	async get()
	{
		const result = await this.request(
		{
			action: () => this.client.get(),
			hydrate: response => this.#hydrate( response )
		});

		return result instanceof Error
			? result
			: result.hydrated;
	}

	/**
	 * It functions similarly to the `get` method, but it only
	 * resolves the resource as a plain object.
	 * 
	 * @return {Promise<object>}
	 */
	async $get()
	{
		const result = await this.request(() =>
			this.client.get()
		);

		return result.data;
	}

	/**
	 * It functions similarly to the `$get` method, but it only
	 * returns the response object.
	 * 
	 * @return {Promise<AxiosResponse>}
	 */
	async $$get()
	{
		const result = await this.request(() =>
			this.client.get()
		);

		return result.response;
	}

	/**
	 * Sends the given payload with `PUT` request to the represented
	 * model's endpoint.
	 * 
	 * @param {string|number|object} targetPrimaryKeyValueOrPayload a primary key
	 * value or a plain object as payload
	 * @param {object=} payload 
	 * @return {Promise<Model>|Promise<Collection>}
	 */
	async put( targetPrimaryKeyValueOrPayload, payload )
	{
		const result = await this.request(
		{
			action: () => this.client.put( ...arguments ),
			hydrate: response => this.#hydrate( response )
		});

		return result.hydrated;
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
	 * @param {string|number|object} primaryKeyValue a primary key value
	 * or a plain object as payload
	 * @param {object} payload params to be sent to the resource
	 * @return {Promise<Model>|Promise<Collection>}
	 */
	async patch( primaryKeyValue, payload )
	{
		const result = await this.request(
		{
			action: () => this.client.patch( ...arguments ),
			hydrate: response => this.#hydrate( response ),
			after: () => this.modelInstance.clean()
		});

		return result.hydrated;
	}

	/**
	 * @async
	 * @callback ActionHook
	 * @return {Promise<AxiosResponse>}
	 */

	/**
	 * @callback HydrateHook
	 * @param {AxiosResponse} response response object returned from restful endpoint
	 * @return {object} hydrated resource
	 */

	/**
	 * @callback AfterHook
	 */

	/**
	 * @typedef RequestLifecycleHooks
	 * @type {object}
	 * @property {ActionHook=} action a method encapsulates requesting operations
	 * @property {HydrateHook=} hydrate a method encapsulates hydrating operations
	 * @property {AfterHook=} after a method encapsulates actions to be run after receiving response
	 */

	/**
	 * @typedef RestormResponse
	 * @type {object}
	 * @property {Model|Collection} hydrated the response body instantiated as a model or collection
	 * @property {AxiosResponse} response response object
	 * @property {object|array<{}>} data response data
	 */

	/**
	 * Makes requests, triggers events, runs hooks, converts received
	 * resource to a Model or Collection, and resolves with it.
	 * 
	 * @async
	 * @param {RequestLifecycleHooks=} hooks lifecycle methods
	 * @return {Promise<RestormResponse|Error>}
	 * @emits QueryBuilder#waiting
	 */
	async request({ action, hydrate, after } = {})
	{
		if( typeof arguments[ 0 ] == "function" )
		{
			action = arguments[ 0 ];
		}

		this.trigger( "waiting", [ this ]);

		try
		{
			return this.handleResponse(
				await action( this ),
				hydrate,
				after
			);
		}
		catch( err )
		{
			return this.handleErrors( err, after );
		}
	}

	/**
	 * It handles the response and triggers the appropriate events.
	 * 
	 * @param {AxiosResponse} response response object
	 * @param {HydrateHook=} hydrate hydrate hook
	 * @param {AfterHook=} after method to be run after receiving response
	 * @return {RestormResponse}
	 * @emits QueryBuilder#[StatusCode]
	 * @emits QueryBuilder#success
	 * @emits QueryBuilder#finished
	 */
	handleResponse( response, hydrate, after )
	{
		const args = {}
		const events = [ response.status, "success", "finished" ];

		if( hydrate )
		{
			args.hydrated = hydrate( response );
		}

		if( after )
		{
			after( this );
		}

		args.response = response;
		args.data = this.model.$pluck( response.data );

		this.trigger( events, Object.values( args ));

		return args;
	}

	/**
	 * It handles the errors and triggers the appropriate events.
	 * 
	 * @param {Error} err error object
	 * @param {function} after method to be run after receiving response
	 * @return {Error}
	 * @throws {Error}
	 * @emits QueryBuilder#failed
	 * @emits QueryBuilder#network-error
	 * @emits QueryBuilder#finished
	 */
	handleErrors( err, after )
	{
		const args = [];
		const events = [];

		if( after )
		{
			after( this );
		}

		if( err.isAxiosError )
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
				events.push( err.response.status );
			}

			events.push( "failed", "finished" );

			this.trigger( events, args );

			return err;
		}
		else
		{
			throw err;
		}
	}

	/**
	 * Sets the current query to get the first element of the first
	 * page. Performs the query and returns the first model received.
	 * 
	 * @return {Promise<Model>}
	 */
	async first()
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
	 * @param {string|number} primary 
	 * @return {Promise<Model>}
	 */
	async find( primary )
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
	 * @param {number=} startPage start page
	 * @return {LengthAwarePaginator}
	 */
	paginate( startPage )
	{
		return new LengthAwarePaginator( this, startPage );
	}

	/**
	 * Sets represented model's endpoint to a temporary value.
	 * 
	 * @param {function|(string|Model)[]|object} resources temporary resource
	 * @return {QueryBuilder}
	 */
	from( ...resources )
	{
		if( resources.length == 1 )
		{
			// dynamic determination of resource by function
			if( resources[ 0 ] instanceof Function )
			{
				this.resource = resources[ 0 ]( this.getResource());
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
						resources[ 0 ][ target ]
					);
				}

				this.resource = resource;
				return this;
			}
		}

		const endpoint = [];

		for( const item of resources )
		{
			if( item instanceof Model )
			{
				endpoint.push( item.constructor.resource, item.primary );
			}
			else
			{
				endpoint.push( item );
			}
		}

		this.resource = endpoint
			// we should remove empty elements
			.filter( i => i )
			.join( "/" );

		return this;
	}

	/**
	 * Returns a resource endpoint value for the represented
	 * model, including the one temporarily assigned by the
	 * `QueryBuilder.resource` method.
	 * 
	 * @return {string}
	 */
	getResource()
	{
		return this.resource || this.model.resource;
	}

	/**
	 * @typedef EventListenerOptions
	 * @type {object}
	 * @property {boolean} [append=true] true for append, false for replace mode
	 * @property {boolean} [once=false] true for run the event once or false for
	 * keep it persistent
	 */
	/**
	 * Registers a new event listener.
	 * 
	 * @param {string} evtName event name
	 * @param {function} handler event handler
	 * @param {EventListenerOptions} options options
	 * @return {QueryBuilder}
	 */
	on( evtName, handler, { append = true, once = false } = {})
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
			this.events[ evtName ].clean();
			this.events[ evtName ].add( handler );
		}

		return this;
	}

	/**
	 * Removes the specified event handler from the events list.
	 *
	 * @param {string} evtName the name of the event
	 * @param {function} handler the handler function to be removed
	 * @return {QueryBuilder}
	 */
	off( evtName, handler )
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
	 * @param {string|array} evtNames event name(s)
	 * @param {array} args arguments to pass event listener
	 * @return {QueryBuilder}
	 */
	trigger( evtNames, args = [])
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
	 * @param {string|object} fieldNameOrFieldsObj field name or fields object
	 * @param {function} castingHandler cast implementer
	 * @param {array} payload additional arguments to push cast implementer's arguments
	 * @return {QueryBuilder}
	 */
	cast( fieldNameOrFieldsObj, castingHandler, payload = [])
	{
		if( arguments.length > 1 )
		{
			this.casts[ fieldNameOrFieldsObj ] =
			{
				payload,
				handle: castingHandler,
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
	 * @typedef CompiledQuery
	 * @type {object}
	 * @property {object} filter
	 * @property {object} sort
	 * @property {object} with
	 * @property {object} field
	 * @property {number} limit
	 * @property {number} page
	 */
	/**
	 * Returns an object containing all created filters and criteria.
	 * 
	 * @return {CompiledQuery}
	 */
	compile()
	{
		return {
			...this.#build( "filter", this.wheres ),
			...this.#build( "sort", this.orderBys ),
			...this.#build( "with", this.withs ),
			...this.#build( "field", this.selects ),
			...this.additionalParams,
			limit: this.currentLimit,
			page: this.currentPage,
		}
	}

	/**
	 * Builds given items stack with given name.
	 * 
	 * @param {string} name key name
	 * @param {array|array[]|Value} stack items to build
	 * @return {object}
	 */
	#build( name, stack )
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
	 * @param {AxiosResponse} response response object
	 * @return {Model|Collection<Model>}
	 */
	#hydrate( response )
	{
		const data = this.model.$pluck( response.data );
		const casts = Object.assign({}, this.model.casts, this.casts );

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
	}

}
