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
		return this.http.get( this.query.getResource(),
		{
			signal: this.abortController.signal,
			params: this.query.compile()
		});
	}

	async put( payload )
	{
		const url = this.query.getResource() + "/" + this.query.modelInstance.id;

		return this.http.put( url, payload,
		{
			signal: this.abortController.signal
		});
	}
}
