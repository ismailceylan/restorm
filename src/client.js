import Axios from "axios";

export default class Client
{
	/**
	 * Abortion interface.
	 * 
	 * @type {AbortController}
	 */
	abortController = new AbortController;

	/**
	 * Instantiate a client interface.
	 * 
	 * @param {QueryBuilder} query 
	 */
	constructor( query )
	{
		this.query = query;
		this.model = query.model;

		this.http = Axios.create(
		{
			baseURL: query.model.baseURL
		});
	}

	/**
	 * Terminates ongoing request.
	 * 
	 * @emits QueryBuilder#canceled
	 */
	cancel()
	{
		this.abortController.abort();
		this.abortController = new AbortController();
		this.query.trigger( "canceled", [ this ]);
	}

	/**
	 * Performs `GET` request and returns a promise to fullfill when
	 * received a successful response.
	 * 
	 * @return {Promise<AxiosResponse<any,any>>}
	 */
	get()
	{
		return this.http.get( this.query.getResource(),
		{
			signal: this.abortController.signal,
			params: this.query.compile()
		});
	}

	/**
	 * Performs `PUT` request and returns a promise to fullfil when
	 * received a succesfull response.
	 * 
	 * @param {string|number|object} primaryKeyValueOrPayload primary key
	 * value or payload
	 * @param {object=} payload payload object to put endpoint
	 * @return {Promise<AxiosResponse<any,any>>}
	 */
	put( primaryKeyValueOrPayload, payload )
	{
		if( arguments.length == 1 )
		{
			payload = primaryKeyValueOrPayload;
			primaryKeyValueOrPayload = this.query.modelInstance.primary;
		}

		const url = this.query.getResource() + "/" + primaryKeyValueOrPayload;

		return this.http.put( url, payload,
		{
			signal: this.abortController.signal
		});
	}

	/**
	 * Performs `PATCH` request and returns a promise to fullfil when
	 * received a succesfull response.
	 * 
	 * @param {object} payload field and values for patch resource
	 * @return {Promise<AxiosResponse<any,any>>}
	 */
	patch( payload )
	{
		const url = this.query.getResource() + "/" + this.query.modelInstance.primary;

		return this.http.patch( url, payload,
		{
			signal: this.abortController.signal
		});
	}
}
