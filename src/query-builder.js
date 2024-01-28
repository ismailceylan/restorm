import { Field, Value, Client, Collection, Model } from ".";
import { flatObject, isPlainObject } from "./utils";

export default class QueryBuilder
{
	orderBys = [];
	wheres = [];
	withs = [];
	selects = [];
	scopes = [];
	currentPage = 1;
	currentLimit = 10;
	additionalParams = {}
	temporaryResource = null;
	events = {}

	constructor( Model )
	{
		this.model = Model;
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

	scope( field, value )
	{
		this.scopes.push(
		[
			new Field( field ),
			value
		]);

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

	$$get()
	{
		return this.client.get();
	}

	async $get()
	{
		return this.#stripBody(
			( await this.client.get()).data
		);
	}

	async get()
	{
		return this.#hydrate(
			await this.client.get()
		);
	}

	all()
	{
		return this.get();
	}

	async first()
	{
		const result = await this.page( 1 ).limit( 1 ).get();

		if( result instanceof Model )
		{
			return result;
		}

		if( result instanceof Collection )
		{
			return result.first();
		}
	}

	async find( value )
	{
		const result = await this
			.resource( this.model.resource + "/" + value )
			.page( null )
			.limit( null )
			.get();

		if( result instanceof Model )
		{
			return result;
		}

		if( result instanceof Collection )
		{
			return result.first();
		}
	}

	cancel()
	{
		this.client.cancel();
	}

	on( evtName, handler )
	{
		if( ! ( evtName in this.events ))
		{
			this.events[ evtName ] = [];
		}

		this.events[ evtName ] = handler;

		return this;
	}

	trigger( evtName, args = [])
	{
		if( evtName in this.events )
		{
			this.events[ evtName ]( ...args );
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
			...this.#build( "scope", this.scopes ),
			...this.additionalParams,
			limit: this.currentLimit,
			page: this.currentPage,
		}
	}

	#hydrate( response )
	{
		const data = this.#stripBody( response.data );

		if( isPlainObject( data ))
		{
			return new this.model( data );
		}
		else if( Array.isArray( data ))
		{
			return new Collection(
				data.map( item =>
					new this.model( item )
				)
			);
		}
	}

	#stripBody( responseBody )
	{
		return this.model.$pluck( responseBody );
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
