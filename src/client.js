import Axios from "axios";

export default class Client
{
	abortController = new AbortController;

	constructor( query )
	{
		this.query = query;
		this.model = query.model;

		this.http = Axios.create(
		{
			baseURL: query.model.baseURL
		});
	}

	cancel()
	{
		this.abortController.abort();
		this.abortController = new AbortController();
		this.query.trigger( "canceled" );
	}

	async get()
	{
		try
		{
			const response = await this.http.get( this.query.getResource(),
			{
				signal: this.abortController.signal,
				params: this.query.compile()
			});

			this.query.trigger( response.status, [ response ]);

			return response;
		}
		catch( err )
		{
			this.query.trigger( err.response.status, [ err ]);
			throw err;
		}
	}
}
