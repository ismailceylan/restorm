import Axios, { type AxiosInstance, AxiosResponse } from "axios";
import { Model, QueryBuilder } from ".";
import { isPlainObject } from "./utils";

export default class Client
{
	/**
	 * Abortion interface.
	 */
	abortController: AbortController = new AbortController;

	/**
	 * Query builder instance.
	 */
	query: QueryBuilder;

	/**
	 * Model constructor.
	 */
	model: typeof Model;

	/**
	 * HTTP client interface.
	 */
	http: AxiosInstance;

	/**
	 * Instantiate a client interface.
	 */
	constructor( query: QueryBuilder )
	{
		this.query = query;
		this.model = query.model;

		this.http = Axios.create(
		{
			baseURL: query.model.baseURL,
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
	 */
	get(): Promise<AxiosResponse>
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
	 * @param primaryKeyValueOrPayload primary key value or payload
	 * @param payload payload object to put endpoint
	 */
	put(
		primaryKeyValueOrPayload: string | number | object,
		payload?: object
	): Promise<AxiosResponse>
	{
		if( arguments.length == 1 && isPlainObject( primaryKeyValueOrPayload ))
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
	 * @param payload - the data to be sent in the request
	 * @return a promise that resolves with the response data
	 */
	post( payload: object ): Promise<AxiosResponse>
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
	 * @param payload field and values for patch resource
	 */
	patch( payload: object ): Promise<AxiosResponse>
	{
		const url = this.query.getResource() + "/" + this.query.modelInstance.primary;

		return this.http.patch( url, payload,
		{
			signal: this.abortController.signal
		});
	}
}
