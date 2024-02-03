import Collection from "./collection";

export default class Paginate extends Collection
{
	startPage = 1;
	builder = null;
	response = null;

	constructor( builder, startPage = 1 )
	{
		super();

		this.builder = builder;
		this.startPage = startPage;
	}

	async ping()
	{
		this.response = await this.builder.page( this.startPage ).$$get();

		this.data = this.builder.model
			.$pluck( this.response.data )
			.map( item =>
				new this.builder.model( item )
			);

		return this;
	}

	async next()
	{
		this.startPage++
		return this.ping();
	}
}
