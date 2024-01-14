import Axios from "axios";

export default class Client
{
	constructor( query )
	{
		this.query = query;
		
		this.http = Axios.create(
		{
			baseURL: query.model.baseURL
		});
	}

	get()
	{
		return this.http.get( this.query.getResource(),
		{
			params: this.query.compile()
		});
	}
}
