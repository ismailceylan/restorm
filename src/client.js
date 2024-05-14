import Axios from "axios";

/**
 * @typedef {import('axios').AxiosResponse} AxiosResponse
 */
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
		this.query.trigger([ "canceled", "finished" ], [ this ]);
	}

	/**
	 * Performs `GET` request and returns a promise to fullfill when
	 * received a successful response.
	 * 
	 * @return {Promise<AxiosResponse>}
	 */
	get()
	{
		return this.http.get(
			this.query.getResource(),
			{
				signal: this.abortController.signal,
				params: this.query.compile()
			}
		);
	}

	/**
	 * Performs `PUT` request and returns a promise to fullfil when
	 * received a succesfull response.
	 * 
	 * @param {string|number|object} primaryKeyValueOrPayload primary key
	 * value or payload
	 * @param {object=} payload payload object to put endpoint
	 * @return {Promise<AxiosResponse>}
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
	 * Performs a `POST` request and returns a promise to fulfill when
	 * a successful response is received.
	 *
	 * @param {object} payload - the data to be sent in the request
	 * @return {Promise<AxiosResponse>} a promise that resolves with the response data
	 */
	post( payload )
	{
		return this.http.post(
			this.query.getResource(),
			payload,
			{
				signal: this.abortController.signal
			}
		);
	}

	/**
	 * Performs `PATCH` request and returns a promise to fullfil when
	 * received a succesfull response.
	 * 
	 * @param {object} payload field and values for patch resource
	 * @return {Promise<AxiosResponse>}
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
