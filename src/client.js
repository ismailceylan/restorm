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
		this.query.trigger( "canceled", [ this ]);
	}

	async get()
	{
		try
		{
			this.query.trigger( "waiting", [ this ]);

			const response = await this.http.get( this.query.getResource(),
			{
				signal: this.abortController.signal,
				params: this.query.compile()
			});

			this.query.trigger( "success", [ response, this ]);
			this.query.trigger( response.status, [ response, this ]);
			this.query.trigger( "finished", [ response, this ]);

			return response;
		}
		catch( err )
		{
			this.query.trigger( "failed", [ err, this ]);
			this.query.trigger( err.response.status, [ err, this ]);
			this.query.trigger( "finished", [ err, this ]);

			throw err;
		}
	}
}
