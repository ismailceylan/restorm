import { QueryBuilder } from ".";

export default class Model
{
	static primaryKey = "id";
	static resource = "";

	modified = {}
	original = {}
	isDirty = false;

	constructor( properties = {})
	{
		this.original = { ...this.original, ...properties }
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

	static first()
	{
		return this.createBuilder().first( ...arguments );
	}
	
	static find( value, primaryKey )
	{
		return this.createBuilder().find( ...arguments );
	}
	
	static resource( resource )
	{
		return this.createBuilder().resource( ...arguments );
	}

	static $pluckMultiple( responseBody )
	{
		return responseBody;
	}
	
	static $pluckSingle( responseBody )
	{
		return responseBody;
	}

	save()
	{

	}

	static createBuilder()
	{
		const builder = new QueryBuilder( this );
	
		Object
			.getOwnPropertyNames( this )
			.filter( name =>
				! [ "name", "prototype", "constructor", "length" ].includes( name ) &&
				this[ name ] instanceof Function
			)
			.forEach( name =>
				builder[ name ] = this[ name ]
			);
	
		return builder;
	}
}

Object.setPrototypeOf( Model.prototype, new Proxy( Model.prototype,
{
	set( _target, key, val, rec )
	{
		rec.modified[ key ] = val;
		return rec.isDirty = true;
	},

	get( _target, key, rec )
	{
		return rec.original[ key ];
	}
}));
