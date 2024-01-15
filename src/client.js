import Axios from "axios";

export default class Client
{
	constructor( query )
	{
		this.query = query;
		this.model = query.model;

		this.http = Axios.create(
		{
			baseURL: query.model.baseURL
		});
	}

	async get()
	{
		const response = await this.http.get( this.query.getResource(),
		{
			params: this.query.compile()
		});

		return response.data;
	}
}
