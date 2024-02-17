import { Field, Value, Client, Collection, LengthAwarePaginator } from ".";
import { flatObject, isPlainObject } from "./utils";

export default class QueryBuilder
{
	orderBys = [];
	wheres = [];
	withs = [];
	selects = [];
	currentPage = null;
	currentLimit = 10;
	additionalParams = {}
	temporaryResource = null;
	events = {}
	casts = {}

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

	where( field, value )
	{
		if( isPlainObject( field ))
		{
			flatObject( field ).forEach( item =>
				this.wheres.push(
				[
					new Field( item.key ),
					new Value( item.value )
				])
			);
		}
		else
		{
			this.wheres.push(
			[
				new Field( field ),
				new Value( value )
			]);
		}

		return this;
	}

	orderBy( field, mode = "asc" )
	{
		if( isPlainObject( field ))
		{
			flatObject( field ).forEach( item =>
				this.orderBys.push(
				[
					new Field( item.key ),
					item.value
				])
			);
		}
		else
		{
			this.orderBys.push(
			[
				new Field( field ),
				mode
			]);
		}

		return this;
	}

	with( resources )
	{
		this.withs = new Value(
			arguments.length > 1
				? [ ...arguments ]
				: resources
		);

		return this;
	}

	page( page )
	{
		this.currentPage = page;

		return this;
	}

	limit( limit )
	{
		this.currentLimit = limit;

		return this;
	}

	params( payload )
	{
		flatObject( payload ).forEach( item =>
		{
			const keys = item.key.split( "." );
			const name = keys.shift() + keys
				.map( key => `[${ key }]` )
				.join( "" );

			this.additionalParams[ name ] = item.value;
		});

		return this;
	}

	when( condition, handler )
	{
		if( condition )
		{
			handler( this, condition );
		}
		
		return this;
	}

	select( ...args )
	{
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

	cast( fieldNameOrFieldsObj, castHandle, payload = [])
	{
		if( arguments.length > 1 )
		{
			this.casts[ fieldNameOrFieldsObj ] =
			{
				payload,
				handle: castHandle,
			}
		}
		else if( isPlainObject( fieldNameOrFieldsObj ))
		{
			Object.assign( this.casts, fieldNameOrFieldsObj );
		}

		return this;
	}

	$$get()
	{
		return this.client.get();
	}

	async $get()
	{
		return this.model.$pluck(
			( await this.client.get()).data
		);
	}

	get()
	{
		return this.request(() =>
			this.client.get()
		);
	}

	put( targetPrimaryKeyValueOrPayload, payload )
	{
		return this.request(() =>
			this.client.put( ...arguments )
		);
	}

	patch()
	{
		if( ! this.modelInstance.isDirty )
		{
			return;
		}

		return this.request(
			() => this.client.patch( this.modelInstance.modified ),
			() => this.modelInstance.clean()
		);
	}

	async request( makeRequest, afterRequested )
	{
		this.trigger( "waiting", [ this ]);

		try
		{
			const response = await makeRequest();
			const result = this.#hydrate( response );
			const argsToPass = [ result, response, this ];

			afterRequested && afterRequested();

			this.trigger( response.status, argsToPass );
			this.trigger( "success", argsToPass );
			this.trigger( "finished", argsToPass );

			return result;
		}
		catch( err )
		{
			if( err?.name == 'AxiosError' )
			{
				const argsToPass = [ err, this ];
	
				this.trigger( err.response.status, argsToPass );
				this.trigger( "failed", argsToPass );
				this.trigger( "finished", argsToPass );
			}
			else
			{
				throw err;
			}
		}
	}

	all()
	{
		return this.page( null ).limit( null ).get();
	}

	async first()
	{
		return ( await this.page( 1 ).limit( 1 ).get()).first();
	}

	find( value )
	{
		return this
			.resource( this.model.resource + "/" + value )
			.page( null )
			.limit( null )
			.get();
	}

	paginate( startPage )
	{
		return ( new LengthAwarePaginator( this, startPage )).ping();
	}

	cancel()
	{
		this.client.cancel();
	}

	on( evtName, handler, { append = false } = {})
	{
		if( ! ( evtName in this.events ))
		{
			this.events[ evtName ] = [];
		}

		if( append )
		{
			this.events[ evtName ].push( handler );
		}
		else
		{
			this.events[ evtName ] = [ handler ];
		}

		return this;
	}

	trigger( evtName, args = [])
	{
		if( evtName in this.events )
		{
			this.events[ evtName ].forEach( handler =>
				handler.call( this, ...args )
			);
		}

		return this;
	}

	resource( resource )
	{
		this.temporaryResource = resource;
		return this;
	}

	getResource()
	{
		if( this.temporaryResource )
		{
			const rs = this.temporaryResource;
			
			this.temporaryResource = null;
			
			return rs;
		}

		return this.model.resource;
	}

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
				data.map( item =>
					new this.model( item, casts )
				)
			);
		}
	}

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
				map[ name + item[ 0 ]] = item[ 1 ].toString();
			}
			else
			{
				map[ name ] = item.toString();
			}
		});

		return map;
	}
}
