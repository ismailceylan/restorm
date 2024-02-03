import Collection from "./collection";

export default class LengthAwarePaginator extends Collection
{
	startPage = 1;
	builder = null;
	response = null;

	constructor( builder, startPage = 1 )
	{
		super();

		this.builder = builder;
		this.startPage = startPage;

		builder
			.params({ paginate: "full" })
			.page( startPage );
	}

	async ping()
	{
		this.response = await this.builder.$$get();

		this.data = this.builder.model
			.$pluck( this.response.data )
			.map( item =>
				new this.builder.model( item )
			);

		return this;
	}

	async next()
	{
		this.builder.page( ++this.startPage );
		return this.ping();
	}
}
