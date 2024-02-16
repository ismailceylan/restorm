import { QueryBuilder } from ".";
import { camelToDash } from "./utils";

export default class Model
{
	static primaryKey = "id";
	static resource = "";
	static casts = {}

	modified = {}
	original = {}
	isDirty = false;

	constructor( properties = {}, casts = {})
	{
		this.original = { ...this.original, ...properties }
		this.#applyCasts( casts );
	}

	static select()
	{
		return this.createBuilder().select( ...arguments );
	}

	static where( field, value )
	{
		return this.createBuilder().where( ...arguments );
	}

	static whereIn( field, values )
	{
		return this.createBuilder().whereIn( ...arguments );
	}

	static orderBy( field, mode = "asc" )
	{
		return this.createBuilder().orderBy( ...arguments );
	}

	static with( relations )
	{
		return this.createBuilder().with( ...arguments );
	}

	static page( page )
	{
		return this.createBuilder().page( ...arguments );
	}

	static limit( limit )
	{
		return this.createBuilder().limit( ...arguments );
	}

	static params( payload )
	{
		return this.createBuilder().params( ...arguments );
	}

	static when( condition, handler )
	{
		return this.createBuilder().when( ...arguments );
	}

	static all()
	{
		return this.createBuilder().all( ...arguments );
	}

	static get()
	{
		return this.createBuilder().get( ...arguments );
	}

	static $get()
	{
		return this.createBuilder().$get( ...arguments );
	}

	static $$get()
	{
		return this.createBuilder().$$get( ...arguments );
	}

	put( payload )
	{
		return this.constructor
			.createBuilder( this )
			.put( ...arguments );
	}

	static first()
	{
		return this.createBuilder().first( ...arguments );
	}
	
	static find( value, primaryKey )
	{
		return this.createBuilder().find( ...arguments );
	}
	
	static paginate( startPage )
	{
		return this.createBuilder().paginate( ...arguments );
	}

	static resource( resource )
	{
		return this.createBuilder().resource( ...arguments );
	}

	static on( evtName, args = [])
	{
		return this.createBuilder().on( ...arguments );
	}

	static cast( fieldNameOrFieldsObj, castHandle )
	{
		return this.createBuilder().cast( ...arguments );
	}

	static $pluck( responseBody )
	{
		return responseBody;
	}

	static createBuilder()
	{
		const builder = new QueryBuilder( this );
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

	static getInheritedMethods()
	{
		const staticMethods = {}
		const ignored = [ "name", "prototype", "constructor", "length" ];
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
					! ignored.includes( name ) && this[ name ] instanceof Function
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

	#applyCasts( casts )
	{
		for( const key in casts )
		{
			this.original[ key ] = casts[ key ](
				this.original[ key ],
				this.original
			);
		}
	}

	toString()
	{
		return JSON.stringify( this.original );
	}

	save()
	{

	}

	has( key )
	{
		return key in this.original;
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
		return instance.original[ key ];
	}
}));
