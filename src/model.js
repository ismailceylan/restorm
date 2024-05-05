import { QueryBuilder } from ".";
import { camelToDash } from "./utils";

export default class Model
{
	/**
	 * The field name to use as the primary key.
	 * 
	 * @static
	 * @type {string}
	 */
	static primaryKey = "id";

	/**
	 * The root URL for the API that serving resources restful way.
	 * 
	 * @static
	 * @type {string}
	 */
	static baseURL = "";

	/**
	 * The resource url piece that the model targets.
	 * 
	 * @static
	 * @type {string}
	 */
	static resource = "";

	/**
	 * Cast map to be applied to all models.
	 * 
	 * @static
	 * @type {object}
	 */
	static casts = {}

	/**
	 * Modifications made to the represented model instance.
	 * 
	 * @type {object}
	 */
	modified = {}

	/**
	 * Safe area for the original data of the model instance.
	 * 
	 * @type {object}
	 */
	original = {}

	/**
	 * Tells whether any modifications have been made to the
	 * model instance.
	 * 
	 * @type {boolean}
	 */
	isDirty = false;

	/**
	 * Returns the value of the primary key whose name is defined
	 * on the model.
	 * 
	 * @readonly
	 * @return {string}
	 */
	get primary()
	{
		return this.original[ this.constructor.primaryKey ];
	}

	/**
	 * Creates a QueryBuilder instance, sets fields that 
	 * resources will contain and returns the QueryBuilder.
	 * 
	 * --------------------------------------------------------
	 * 
	 * @param {string|array|object} singleFieldNameFieldsArrOrFieldsMap field
	 * name fields array or fields map object
	 * @param {array} fields fields list
	 * @return {QueryBuilder}
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
	static select( singleFieldNameFieldsArrOrFieldsMap, fields = [])
	{
		return this.createBuilder().select( ...arguments );
	}

	/**
	 * Creates a QueryBuilder instance, adds filtering
	 * instructions in it and returns the QueryBuilder.
	 * 
	 * ------------------------------------------------
	 * 
	 * @param {string|array|object} fieldNameOrWhereMap 
	 * @param {string|array} value 
	 * @return {QueryBuilder}
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
	static where( fieldNameOrWhereMap, value )
	{
		return this.createBuilder().where( ...arguments );
	}

	/**
	 * Creates a QueryBuilder instance, adds sorting
	 * instructions in it and returns the QueryBuilder.
	 * 
	 * ------------------------------------------------
	 * 
	 * @param {string|object} field field name or an object to order by
	 * @param {"asc"|"desc"} mode order mode (asc or desc)
	 * @return {QueryBuilder}
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
	static orderBy( fieldNameOrObject, mode = "asc" )
	{
		return this.createBuilder().orderBy( ...arguments );
	}

	/**
	 * Creates a QueryBuilder instance, sets related resource
	 * names that should be exists in the returned resource and
	 * returns the QueryBuilder.
	 * 
	 * --------------------------------------------------------
	 * 
	 * @param {...array} resources resource names related with current resource
	 * @return {QueryBuilder}
	 * @example
	 * ```js
	 * Post.with( "author", "comments", "likes" );
	 * // or
	 * Post.with([ "author", "comments" ]);
	 * ```
	 */
	static with( ...resources )
	{
		return this.createBuilder().with( ...resources );
	}

	/**
	 * Creates a QueryBuilder instance, sets the current
	 * page number and returns the QueryBuilder.
	 * 
	 * @param {number} page numeric 1 base page number
	 * @return {QueryBuilder}
	 */
	static page( page )
	{
		return this.createBuilder().page( page );
	}

	/**
	 * Creates a QueryBuilder instance, sets the
	 * limit and returns the QueryBuilder.
	 * 
	 * @param {number} limit limit
	 * @return {QueryBuilder}
	 */
	static limit( limit )
	{
		return this.createBuilder().limit( limit );
	}

	/**
	 * Creates a QueryBuilder instance, sets the
	 * additional params and returns the QueryBuilder.
	 * 
	 * @param {object} payload an object that contains the additional params to pass
	 * @return {QueryBuilder}
	 */
	static params( payload )
	{
		return this.createBuilder().params( payload );
	}

	/**
	 * A method that receive query builder instance
	 * and original condition from arguments tunnel.
	 * 
	 * @typedef whenHandler
	 * @type {function}
	 * @param {QueryBuilder} queryBuilder QueryBuilder instance
	 * @param {*} condition condition value to passed through the when method
	 */

	/**
	 * It runs the given function when any given condition value
	 * is truthy. It injects QueryBuilder and condition values
	 * into the function respectively.
	 * 
	 * @param {boolean} condition any boolean value
	 * @param {whenHandler} handler condition handler callback
	 * @return {QueryBuilder}
	 */
	static when( condition, handler )
	{
		return this.createBuilder().when( ...arguments );
	}

	/**
	 * Sets page number and limit null and sends
	 * a request to retrieve all resources.
	 * 
	 * @return {Promise<Collection<Model>>}
	 */
	static all()
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
	 * 
	 * @return {Promise<Model>|Promise<Collection<Model>>}
	 */
	static get()
	{
		return this.createBuilder().get();
	}

	/**
	 * It functions similarly to the `get` method, but it only
	 * returns the resource as a plain object.
	 * 
	 * @return {Promise<{}>}
	 */
	static $get()
	{
		return this.createBuilder().$get();
	}

	/**
	 * It functions similarly to the `$get` method, but it
	 * only returns the response object.
	 * 
	 * @return {Promise<AxiosResponse<any,any>>}
	 */
	static $$get()
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
	 * @param {string|number|object} primaryKeyValue a primary key value
	 * @param {object} payload params to be sent to the resource
	 * @return {Promise<Model>|Promise<Collection<Model>>}
	 */
	static put( primaryKeyValue, payload )
	{
		const query = this.createBuilder();

		return query.request(() =>
			query.client.put( ...arguments )
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
	 * @param {string|number} primaryKeyValue a primary key value
	 * @param {object} payload params to be sent to the resource
	 * @return {Promise<Model>|Promise<Collection<Model>>}
	 */
	static patch( primaryKeyValue, payload )
	{
		const query = this.createBuilder();

		return query.request(
			() => query.client.patch( ...arguments ),
			() => this.clean()
		);
	}

	/**
	 * Sets the current query to get the first element of the first
	 * page. Performs the query and returns the first model received.
	 * 
	 * @return {Promise<Model>}
	 */
	static first()
	{
		return this.createBuilder().first();
	}

	/**
	 * Requests the resource with the given primary value located
	 * at the represented resource endpoint.
	 * 
	 * @param {string|number} primary 
	 * @return {Promise<Model>|Promise<Collection<Model>>}
	 */
	static find( primary )
	{
		return this.createBuilder().find( primary );
	}

	/**
	 * Returns length aware paginator interface for represented
	 * model.
	 * 
	 * @param {number=} startPage start page
	 * @return {LengthAwarePaginator}
	 */
	static paginate( startPage )
	{
		return this.createBuilder().paginate( startPage );
	}

	/**
	 * Sets represented model's endpoint to a temporary value.
	 * 
	 * @param {[string|Model]} resources temporary resource
	 * @return {QueryBuilder}
	 */
	static from( ...resources )
	{
		return this.createBuilder().from( ...resources );
	}

	/**
	 * @typedef eventListenerOptions
	 * @type {object}
	 * @property {boolean} append true for append, false for replace mode
	 * @property {boolean} once true for run the event once or false for
	 * keep it persistent
	 */
	/**
	 * Registers a new event listener.
	 * 
	 * @param {string} evtName event name
	 * @param {function} handler event handler
	 * @param {eventListenerOptions} options options
	 * @return {QueryBuilder}
	 */
	static on( evtName, handler, { append = true, once = false } = {})
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
	 * @param {string|object} fieldNameOrFieldsObj field name or fields object
	 * @param {function} castHandle cast implementer
	 * @param {array} payload additional arguments to push cast implementer's arguments
	 * @return {QueryBuilder}
	 */
	static cast( fieldNameOrFieldsObj, castHandle, payload = [])
	{
		return this.createBuilder().cast( ...arguments );
	}

	/**
	 * It receives a plain object representing a resource object
	 * and should extract the resource from it and return it.
	 * 
	 * Specific models should override this method to ensure that
	 * their scenarios are applied to obtain the actual resource
	 * from the response data.
	 * 
	 * @static
	 * @param {object} responseBody a plain object representing a resource
	 * or resource collection
	 * @return {object}
	 */
	static $pluck( responseBody )
	{
		return responseBody;
	}

	/**
	 * It receives a plain object representing a resource and pagination
	 * metadata and should extract the metadata from it and return it.
	 * 
	 * Specific models should override this method to ensure that
	 * their scenarios are applied to obtain the actual resource
	 * from the response data.
	 * 
	 * @static
	 * @param {object} responseBody a plain object holds a resource and
	 * pagination metadata
	 * @return {object}
	 */
	static $pluckPaginations( responseBody )
	{
		return responseBody;
	}

	/**
	 * Creates and returns a QueryBuilder instance.
	 * 
	 * @param {Model=} modelInstance 
	 * @return {QueryBuilder}
	 */
	static createBuilder( modelInstance )
	{
		const builder = new QueryBuilder( this, modelInstance );
		const methods = this.getInheritedMethods();

		Object.keys( methods ).forEach( name =>
		{
			const method = methods[ name ];

			if( name.slice( 0, 2 ) == "on" )
			{
				builder.on(
					camelToDash( name.slice( 2 )),
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
	 * 
	 * @return {object}
	 */
	static getInheritedMethods()
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
	 * Checks if the given instance is an instance of the model.
	 * 
	 * @param {any} instance
	 * @return {boolean}
	 */
	static [ Symbol.hasInstance ]( instance )
	{
		return this instanceof instance.constructor;
	}

	/**
	 * Instantiates the model with the given data.
	 * 
	 * @param {object} properties original data of the model
	 * @param {object} casts additional casting map to apply the model
	 * when data retreived
	 */
	constructor( properties = {}, casts = {})
	{
		this.init( properties, casts );
	}

	/**
	 * Initializes model with data and casting map.
	 * 
	 * @param {object} properties original properties
	 * @param {object} casts casting map
	 * @return {Model}
	 */
	init( properties, casts )
	{
		this.original = { ...this.original, ...properties }
		this.#applyCasts( casts );
		
		return this;
	}

	post( payload )
	{
		
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
	 * @param {object} payload params to be sent to the resource
	 * @return {Promise<Model>|Promise<Collection<Model>>}
	 */
	put( payload )
	{
		const query = this.constructor.createBuilder( this );

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
	 * @param {object} payload params to be sent to the resource
	 * @return {Promise<Model>|Promise<Collection<Model>>}
	 */
	patch( payload )
	{
		const query = this.constructor.createBuilder( this );

		return query.request(
		{
			action: () => query.client.patch( payload || this.modified ),
			after: () => this.clean( payload || this.modified)
		});
	}

	/**
	 * It checks whether the given field name is in the original data.
	 * 
	 * @param {string} key name of the field to check
	 * @return {boolean}
	 */
	has( key )
	{
		return key in this.original;
	}

	/**
	 * Registers a new event listener.
	 * 
	 * @param {string} evtName event name
	 * @param {function} handler event handler
	 * @param {eventListenerOptions} options options
	 * @return {QueryBuilder}
	 */
	on( evtName, handler, { append = true, once = false } = {})
	{
		return this.constructor
			.createBuilder( this )
			.on( evtName, handler, { append, once });
	}

	/**
	 * It stores a method that will perform cast operations on a
	 * given field of the resource.
	 * 
	 * When each get request is completed, the stored methods are
	 * executed by taking the field values they are associated with.
	 * 
	 * @param {string|object} fieldNameOrFieldsObj field name or fields object
	 * @param {function} castHandle cast implementer
	 * @param {array} payload additional arguments to push cast implementer's arguments
	 * @return {QueryBuilder}
	 */
	cast( fieldNameOrFieldsObj, castHandle, payload = [])
	{
		return this.constructor
			.createBuilder( this )
			.cast( ...arguments );
	}

	/**
	 * Runs handlers from the given cast stack on the represented
	 * resource data.
	 * 
	 * @param {object} casts field: handler for casting
	 */
	#applyCasts( casts )
	{
		for( const key in casts )
		{
			const cast = casts[ key ];;
			let handle, payload;

			if( typeof( casts[ key ]) == "function" )
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
	 * 
	 * @return {string}
	 */
	toString()
	{
		return JSON.stringify( this.original );
	}

	/**
	 * Moves changed field values over original values.
	 * 
	 * @param {object} payload
	 */
	clean( payload )
	{
		for( const key in payload )
		{
			this.original[ key ] = payload[ key ];

			delete payload[ key ];
		}

		this.isDirty = false;
	}
}

Object.setPrototypeOf( Model.prototype, new Proxy( Model.prototype,
{
	set( Model, key, val, instance )
	{
		if( instance.original[ key ] === val )
		{
			delete instance.modified[ key ];
			instance.isDirty = Object.keys( instance.modified ).length > 0;
		}
		else
		{
			instance.modified[ key ] = val;
			instance.isDirty = true;
		}

		return true;
	},

	get( Model, key, instance )
	{
		if( key === Symbol.toStringTag )
		{
			return "Model";
		}

		return instance.original[ key ];
	}
}));
