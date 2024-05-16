# Introduction
Restorm is a lightweight JavaScript library designed to streamline the process of handling RESTful services within client-side applications. With Restorm, we can easily model data on the client side and interact with RESTful APIs by adhering to predefined rules and conventions.

This library simplifies the communication process between the client and server, abstracting away the complexities of HTTP requests and allowing developers to focus on building robust, scalable applications. Whether you're fetching data, creating new resources, or updating existing ones, Restorm provides a well known interface for performing CRUD operations while ensuring compliance with RESTful principles.

With its intuitive design and flexible configuration options, Restorm empowers developers to efficiently integrate RESTful services into their JavaScript applications, enhancing productivity and promoting best practices in web development.

# Installation
To install Restorm, you can use npm:

```
npm install @iceylan/restorm
```

# Initialization

Set up on `src/models`.

```js
// base-model.js
import { Model } from "@iceylan/restorm";

export default class BaseModel extends Model
{
	baseUrl = "https://yourdomain.com/api/v1.0";
}
```

```js
// post.js
import { BaseModel } from ".";

export default class Post extends BaseModel
{
	resource = "posts";
}
```

# Building The Query
After preparing our models, we can create RESTful requests with them.

## Retreiving a List of Resources
There are two ways to get a list of resources.

* `all` - Get all resources as collection under any circumstance.
* `get` - Get all resources as collection or a single resource model.

### Using all Method
The `all` method creates a request to access all resources under the root directory of endpoint.

It will make sure that even the response has only one resource, the resolved promise will be fulfilled with a collection and that collection will be filled with instance(s) of the model(s).

If the response is empty, the promise will be fulfilled with an empty collection.

```js
const posts = await Post.all();
```

```
GET /api/v1.0/posts
```

### Using get Method
If we are sure that the endpoint is kind of a multiple resource returner or we are aware that we should have to deal with the results either as a collection or a single model then we can use `get` method.

The method will detect the returned resource's type and returns a promise that will be fulfilled with an instance of `collection` of models or an instance of `model`.

```js
import { Collection } from "@iceylan/restorm";

const result = await Post.where( conditions ).get();

if( result instanceof Collection )
{
	result.forEach( post =>
		console.log( post.id )
	);
}
```

```
GET /api/v1.0/posts
```

## Retrieving a Single Resource
There are three methods that enable us to obtain a single resource.

* `first` - Get the first resource in a resource collection.
* `find` - Find a specific resource based on the primary key.
* `get` - Get all resources as collection or a single resource model.

### Getting the First Resource
The `first` method creates a request to the root directory of resources with filtering criteria, and it requests the first item of the results found.

The returned promise is fulfilled with an instance created from the Post model.

```js
const post = await Post.first();
```

```
GET /api/v1.0/posts?limit=1
```

### Finding a Specific Resource
The `find` method creates a request to access a resource under the root directory of resources using a primary key.

```js
const post = await Post.find( 1 );
```

```
GET /api/v1.0/posts/1
```

### Using get Method
The `get` method creates a request to access all resources under the root directory of restful endpoint with filtering criteria. The results may be a single resource or an array of resources.

`get` will autodetect the returned resource type and return a promise that will be fulfilled with an instance of the `model` or `collection` of models.

```js
import { Model } from "@iceylan/restorm";

const result = await Post.where( conditions ).get();

if( result instanceof Model )
{
	console.log( result.title );
}
```

```
GET /api/v1.0/posts
```

## Including Relationships
The `with` method is used to include related resource to a model. This process is known as eager loading. We can provide as many relationship names as arguments to the method or as an array.

We can directly include a related resource by its model:

```js
const posts = await Post
	.with( "comments", "author" )
	// or
	.with([ "comments", "author" ])
	.all();
```

```
GET /api/v1.0/posts?with=comments,author
```

With that, the API endpoint will return the posts with their comments and authors.

### Including Nested Relationships
Even including nested relationships is possible. That means we can include the related resources of the related resources and so on.

```js
const posts = await Post.with( "author", "comments.author" ).all();
```

```
GET /api/v1.0/posts?with=author,comments.author
```

The API endpoint should return the following response:

```json
[
	{
		"id": 1,
		"post": "lorem ipsum",
		"author":
		{
		    "id": 1,
		    "name": "John Doe"
		},
		"comments":
		[
		    {
		        "id": 1,
		        "comment": "lorem ipsum",
		        "author":
		        {
		            "id": 1,
		            "name": "Jane Doe"
		        }
		    }
		]
	}
]
```

## Filtering Resources
To list specific resources, we add filters with `where` method to accomplish this.

We can directly filter represented resources by models:

```js
const articles = await Post.where( "type", "article" ).all();
```

```
GET /api/v1.0/posts?filter[type]=article
```

### Filtering Related Resource
If the related resource that we included in by `with` method is kind of multiple (i.e., one-to-many), for example comments of a post, we can also indirectly add filters to these sub-resources (comments) to reduce the returned results.

```js
const articles = await Post
	.where( "type", "article" )
	.with( "comments" )
	.where( "comments.state", "approved" )
	// or
	.where([ "comments", "state" ], "approved" )
	.all();
```

```
GET /api/v1.0/posts?with=comments&filter[type]=article&filter[comments.state]=approved
```

### Object Syntax
We can perform these operations in a more organized and concise manner through object syntax, providing a cleaner and more streamlined usage. For example, if we are using something like vue.js or react.js, we can manage operations on reactive objects and directly pass this object to the `where` method.

```js
const conditions =
{
	type: "article",
	"comments.state": "approved"
	// or
	[ relationName + "." + fieldName ]: "approved",
	// or
	comments:
	{
		state: "approved"
	},
}

const articles = await Post.with( "comments" ).where( conditions ).all();
```

```
GET /api/v1.0/posts?with=comments&filter[type]=article&filter[comments.state]=approved
```

### Multiple Values
We can also add multiple values for a filter.

```js
const posts = await Post.where( "type", [ "article", "news" ]).get();
```

This request will get all the posts of the `article` and `news` types.

```
GET /api/v1.0/posts?filter[type]=article,news
```

We didn't add a separate `whereIn` method because the `where` method is flexible enough to handle it on its own.

```js
const posts = await Post.where( "id", [ 4, 8, 15 ]).get();
```
    
```
GET /api/v1.0/posts?filter[id]=4,8,15
```

## Sorting Resources
The `orderBy` method is used to obtain results sorted by a specific field of resource.

We can directly subject a model to sorting like this:

```js
const posts = await Post.orderBy( "updated_at", "desc" ).get();
```

```
GET /api/v1.0/posts?sort[updated_at]=desc
```

We may also want to sort on two different fields simultaneously.

```js
const posts = await Post
	.orderBy( "updated_at", "asc" )
	.orderBy( "created_at", "desc" )
	.get();
```

```
GET /api/v1.0/posts?sort[updated_at]=asc&sort[created_at]=desc
```

### Sorting Related Resources
We can also subject the related model to the sorting process.

```js
const posts = await Post
	.with( "comments.replies" )
	.orderBy( "comments.id", "desc" );
	// or with array syntax
	.orderBy([ "comments", "id" ], "desc" );
	// or we can go further and sort on nested relationships
	.orderBy( "comments.replies.created_at", "desc" );
	.all();
```

```
GET /api/v1.0/posts?with=comments.replies&sort[comments.id]=desc&sort[comments.replies.created_at]=desc
```

### Object Syntax
We can use object syntax to organize sorting operations.

```js
const sorting =
{
	updated_at: "desc",
	created_at: "asc",
	"comments.id": "desc",
	// or
	[ relationName + "." + fieldName ]: "desc",
	// or
	comments:
	{
		id: "desc",
		replies:
		{
			created_at: "desc"
		}
	}
}

const posts = await Post.with( "comments" ).orderBy( sorting ).get();
```

```
GET /api/v1.0/posts?with=comments&sort[updated_at]=desc&sort[created_at]=asc&sort[comments.id]=desc&sort[comments.replies.created_at]=desc
```

## Selecting Fields
The `select` method is used to select specific fields from the model. 

```js
const posts = await Post.select([ "id", "title", "author_id" ]).get();
```

```
GET /api/v1.0/posts?field[]=id,title,author_id
```

### Selecting Related Resource Fields
We can also select fields from the related resources. First argument of the `select` method is the name of the related resource. We can provide relation name as a string with dot notation or as an array and the field names should be provided as an array.

```js
const posts = Post
	.select( "comments", [ "id", "author_id", "comment" ])
	.select([ "comments", "author" ], [ "id", "username" ])
	// or
	.select( "comments.author", [ "id", "username" ])
	.get();
```

```
GET /api/v1.0/posts?field[comments]=id,author_id,comment&field[comments.author]=id,username
```

### Object Syntax
We can use object syntax to organize field selection operations. To select fields directly from the model, we should define an empty key or relation name as a key and provide an array of fields to selected as the value.

```js
const selections =
{
	// resource fields
	"": [ "id", "title", "author_id" ],
	// related resource fields
	comments: [ "id", "author_id", "comment" ],
	// deeply related resource fields
	"comments.author": [ "id", "username" ],
	// or
	comments:
	{
		author: [ "id", "username" ]
	}
}

const posts = Post.select( selections ).all();
```

```
GET /api/v1.0/posts?field[]=id,title,author_id&field[comments]=id,author_id,comment&field[comments.author]=id,username
```

## Pagination
Pagination is a process of dividing a large set of data into smaller and more manageable chunks. Restorm provides basic and advanced pagination support.

### Basic Pagination
We can accomplish this process manually by using the `page` and `limit` methods. With two of these methods, we can get the desired paginated results.

So, let's see how we can use these methods.

#### Page
The `page` method is used to specify the page number.

```js
const posts = await Post.page( 2 ).all();
```

```
GET /api/v1.0/posts?page=2
```

#### Limit
The `limit` method is used to specify the number of items per page.

```js
const posts = await Post.limit( 10 ).all();
```

```
GET /api/v1.0/posts?limit=10
```

If the limit value we are going to use is the same most of the time, we can define it in the model instead of using the `limit` method every time.

```js
class Post extends BaseModel
{
	itemsPerPage = 10;
}

const posts = await Post.all();
```

```
GET /api/v1.0/posts?limit=10
```

We defined a default limit on Post level. The query would give us the first 10 posts.

```js
const [ firstPage, secondPage ] = await Promise.all(
[
	Post.page( 1 ).all(),
	Post.page( 2 ).all()
]);
```

We requested the first and second page and got the first and second 10 posts simultaneously.

### Advanced Pagination
The `paginate` method can handle the pagination process that we have been doing manually and adds some extra features to it.

This method returns a `LengthAwarePaginator` instance which it extends our `Collection` class. We will see soon what collections can do but for now, that makes it an advanced collection that can be used to get the total number of items, current page, items per page, total number of pages, request the next page with ease and of course get the items.

```js
const paginator = await Post.paginate();
```

```
GET /api/v1.0/posts?limit=10&page=1&paginate=length-aware
```

#### Pagination Metadata
The `LengthAwarePaginator` has a property named `page` which holds a `Page` instance. If the Rest API that we are requesting has included pagination metadata in its responses, this information is abstracted with the `Page` class, and we can access it through the paginator.

Let's now explore what these useful pagination information are.

##### Current Page
The `currentPage` property holds the current page number.

```js
const { currentPage } = paginator.page;
```

##### From
The `from` property holds the starting item number.

```js
const { from } = paginator.page;
```

##### Last Page
The `lastPage` property holds the last page number.

```js
const { lastPage } = paginator.page;
```

##### Per Page
The `perPage` property holds the number of items per page.

```js
const { perPage } = paginator.page;
```

##### To
The `to` property holds the ending item number.

```js
const { to } = paginator.page;
```

##### Total
The `total` property holds the total number of items.

```js
const { total } = paginator.page;
```

##### End
The `end` property is a flag that indicates if the pagination is at the end and there are no more items to be fetched. It's a read-only property. The value of this property is calculated from the `currentPage` and `lastPage` properties.

```js
const { end } = paginator.page;
```

#### Normalizing Pagination Metadata
Restful APIs can provide various types of pagination metadata depending on the frameworks, libraries and developers. The `Page` class normalizes this metadata into a consistent format, but we need to specify which information corresponds to which attribute and distribute them properly.

We achieve this by defining a static method called `$pluckPaginations` on our models. Restorm invokes this method by passing the body of the response sent by the Restful API and the `Page` instance through the argument tunnel. We should then use these objects to ensure the necessary distribution.

For example, while our post data may be provided through Django and user data may be powered by Laravel. In those kind of cases, we can define the mentioned function individually in the `Post` model and the `User` model. Otherwise if all the data is being fed by the same framework, we can write it once in the `BaseModel`.

```js
// models/base-model.js
import { Model } from "restorm";

class BaseModel extends Model
{
	static $pluckPaginations( page, responseBody )
	{
		page.currentPage = responseBody.current_page;
		page.lastPage = responseBody.last_page;
		page.perPage = responseBody.per_page;
		page.total = responseBody.total;
		page.from = responseBody.from;
		page.to = responseBody.to;
	}
}
```

#### Querying Next Page
Paginators allows us to query the next page of resources that we are currently working on. We can do this by calling the `next` method on the paginator instance.

There is no need to track the current page number, increase it etc. as Restorm will handle this for us.

Additionally, Restorm keeps track of whether requests have been completed or not. When the `next` method is called, if there is still a pending request awaiting response, the call is ignored. We don't need to deal with such matters.

```js
await paginator.next();

paginator.forEach( post =>
	console.log( post.title )
);
```

```
GET /api/v1.0/posts?limit=10&page=2&paginate=length-aware
```

We used same paginator instance to access fetched resources as models placed on it.

## Conditional Queries
Sometimes, we might want to add a constraint to our query. To do this, we can use the `when` method. The first argument is a boolean expression, and the second is a callback function. The callback will receive query builder instance and the condition flag's value as arguments.

The main advantage of using `when` method is that it allows us to keep querying in a single line without breaking the chain. Otherwise, we would have to use if-else statements and add more lines.

```js
const posts = await Post
	.when( getUserId(), ( query, userId ) =>
		query.where( "author_id", userId )
	)
	.all();

function getUserId()
{
	if( something )
	{
		return 481516;
	}
	else
	{
		return null;
	}
}
```

```
GET /api/v1.0/posts?filter[author_id]=481516
```

You have to be careful with falsy values. For example, if you pass `0` as an user ID, it will be considered as `false`, and the constraint block won't be executed, even though it should by your perspective.

## Additional Params
Sometimes, we might want to pass additional parameters to the query that restorm doesn't handle explicitly.

To do this, we can use the `params` method. It accepts an object of additional parameters. We should pass all the parameters that we want to pass to the query at once.

```js
const params =
{
	foo: "bar",
	do: true,
	some: [ "good", "bad", "ugly" ]
}

const posts = await Post.params( params ).get();
```

```
GET /api/v1.0/posts?foo=bar&do=true&some=good,bad,ugly
```

## Custom Resource
If we want to use a custom resource, we can do it by using the `from` method.

With this method, we can bypass the current resource defined on the model and create requests to a custom resource temporarily.

### Static Resource
We can specify the resource name directly as a string.

```js
const posts = await Post.from( "timeline" ).all();
```

```
GET /api/v1.0/timeline
```

All the items in the returned collection will be instance of `Post` model.

### Model Aware Custom Resource
Sometimes, we might want to build dynamic resource URIs depending on some model instances that we have already.

```js
const post = new Post({ id: 48 });
const comment = new Comment({ id: 4815, post_id: post.id });

const reactions = await Reaction.from( post, comment, "reactions" ).all();
```

```
GET /api/v1.0/posts/48/comments/4815/reactions
```

# CRUD Operations
Restorm provides a set of methods that allow us to perform CRUD operations on RESTful resources, and we have seen above how to handle the `(R)ead` side by `get`, `all`, `find`, `first` methods.

So let's see how to perform `(C)reate`, `(U)pdate` and `(D)elete` operations.

## Create
On HTTP protocol, a resource creation should be performed by sending a `POST` request to the RESTful api endpoints.

We designed a few alternative ways to create resources. First, we can create resources as model instances and send them.

```js
const title = "Elon Musk went to the Moon instead of Mars";
const content = "Yeah! You heard right, he did just like that! Unbelievable.";

const draft = new Article({ title });

// and we can assign missed properties later to the model
draft.content = content;

const article = await draft.post();
// or
const article = await draft.save();

if( article instanceof AxiosError )
{
	console.log( "network or server errors", article );
}
```

The `post` method returns a promise that will be fulfilled with an instance of `Article` model or an `Error` if there is an issue. Errors won't be thrown and you can't catch them with `async-await & try-catch` or `then-catch` mechanism. Restorm will supress throwing all the HTTP errors with 400 and 500 status codes and network errors as well.

If you want to handle errors then you can add event listeners to your queries or models, or you can handle it manually when they're returned by `post` method.

If Restorm detects issues with the usage of its methods, it will throws an error and stops your application. You shouldn't catch and handle that kind of errors manually and suppress them, just have to solve and disappear them.

We can also statically use the `post` method.

```js
const newArticle = await Article.post(
{
	title: "Elon Musk went to the Moon instead of Mars",
	content: "Yeah! You heard right, he did just like that! Unbelievable."
});

console.log( newArticle.id );
// 1
```

```
POST /api/v1.0/articles
```

The result should look like this:

```json
{
	"id": 1,
	"title": "Elon Musk went to the Moon instead of Mars",
	"content": "Yeah! You heard right, he did just like that! Unbelievable."
}
```

The `post` method is very self-explanatory, it just sends a `POST` request to the api endpoint but the `save` method has something magical behind it.

If the primary key (`id` in this case) is not set on the model instance like the example above, it will send a `POST` request, otherwise it will send a `PATCH` request. We will see that in the next sections.

## Update
We can update an existing resource by sending a `PATCH` or `PUT` request to api endpoints.

As you know already the `PUT` is used to update an existing resource as a whole. That means, missing properties should convert to `null` or default values on the database.

The `PATCH` on the other hand, is used to update only some of the properties of the resource and missing properties will be stay as they are. This is what makes `PATCH` lightweight compared to `PUT`.

Restorm smart enough to know which properties of the model you modified and that gives us an opportunity to send always a lightweight `PATCH` request instead of a `PUT`.

```js
const article = await Article.find( 1 );

article.title = "Jeff Bezos went to the Moon instead of Mars";

await article.save();
// or more explicitly
await article.patch();
```

```
PATCH /api/v1.0/articles/1
```

And the resource will be like:

```json	
{
	"id": 1,
	"title": "Jeff Bezos went to the Moon instead of Mars",
	"content": "Yeah! You heard right, he did just like that! Unbelievable."
}
```

The `save` method always sends a `PATCH` request if the case is about updating an existing resource. However, sometimes we really want to send a `PUT` request. We can do that by using the `put` method of Restorm.

```js
const state =
{
	title: "Jeff Bezos went to the Moon instead of Mars"
}

// we can get the resource as a model from the endpoint
const article = await Article.find( 1 );

// or we can bake the model manually without `GET` request
// if we sure that the resource exists remotely
const article = new Article({ id: 1 });

// and we can send a `PUT` request for a model
await article.put( state );

// or shortly we can use static syntax
await Article.put( 1, state );
```

```
PUT /api/v1.0/articles/1
```

And the resource should be like:

```JSON
{
	"id": 1,
	"title": "Jeff Bezos went to the Moon instead of Mars",
	"content": null
}
```

# Event Management
Restorm provides an event management system to handle network errors, server errors and internal events. 

We can bind event listeners to our queries, models or model instances. Events are kind of hooks that will be triggered when certain events happen.

Since Restorm have this mechanism, it doesn't need to throw network and server errors. Restorm only throws runtime errors. So that means network errors and 400-500 errors will be suppressed and won't stop the application. We should grab and handle them manually.

We can register our listeners with `on` method.

Multiple event listeners can be added for a single event. The bound event listeners will be executed in the order they were bound when the event occurs.

## QueryBuilder Event Binding
```js
const post = await Post
	.on( "failed", gettingPostFailed )
	.find( 1 );

const another = await Post.find( 2 );

function gettingPostFailed( err )
{
	console.log( err )
}
```

Note that if the `on` method on the models called statically just like the above, it will create a `QueryBuilder` instance internally, binds the event listener we passed to it and returns query builder instance.

The event listeners that bound to a `QueryBuilder` will be effective only for that specific query builder instance.

The first query will print the error object in the console when the api endpoint returns an 400, 500 http status code or a network error happens. But the second query won't log anything even if it has an error because it's running on a different query builder instance and we didn't bind any event listener to it.

We can easily remove the event listeners by using `off` method but we should extract the `QueryBuilder` instance when using static methods of a models.

```js
const query = Post.on( "failed", gettingPostFailed );
const post = await query.find( 1 );

query.off( "failed", gettingPostFailed );

const anotherPost = await query.find( 2 );
```

Even if the second query has an error, it won't be logged because we unbound the event listener from it.

We can also make event listeners to execute only once by using `once` property while we bind the event.

```js
const post = await query
	.on( "failed", gettingPostFailed, { once: true })
	.find( 1 );

// or

const post = await Post
	.on( "failed", gettingPostFailed, { once: true })
	.find( 1 );
```

## Model Instance Event Binding
As you know already, Restorm transforms remote resources into `Model` instances. We also can bind event listeners to any model instance.

```js
const post = await Post.find( 1 );

post.id = 12;
post.on( 304, postNotModified );

await post.patch();
// or shortly
await post.on( 304, postNotModified ).patch();

function postNotModified( post, response, data )
{
	console.log ( post );

	// this word refers to QueryBuilder instance
	console.log( this );
}
```

This time, the `on` method is not static. It operates on the context of the model that represents the resource and that model has its own query builder instance. It will bind the event listener we provided to this query builder and return the model's itself. Also, patching will happen over the same `QueryBuilder` instance. So we were able to chain all those methods in one line.

We can still remove the event listener by using `off` method and make event listener to run only once by using `once` property just like above.

We could write same code more compactly like this:

```js
const post = ( await Post.find( 1 ))
	.on( 304, ( post, response, data ) => console.log( post ))
	.patch({ id: 12 });
```

## Global Event Binding
Sometimes we might want to bind event listeners for all queries to track events globally (app level).

We can define global event listeners as static methods on the models prefixed with `on` keyword like `onFailed` or `onSuccess`.

```js
import { Model } from "@iceylan/restorm";

class BaseModel extends Model
{
	static onFailed( err )
	{
		console.log( err );

		// this word refers to QueryBuilder instance
		console.log( this );
	}
}

const post = await Post.find( 1 );
```

From now on, every child model of the `BaseModel` will inherit a listener for the `failed` event.

We can overwrite the event listeners in child models.

```js
class Post extends BaseModel
{
	static onFailed( err )
	{
		alert( err.message );
	}
}
```

Now, all the failed queries of the `Post` model will be displayed in alert dialog instead of console.

If we want, we can extend parent model's event listeners instead of overwriting them.

```js
class Post extends BaseModel
{
	static onFailed( err )
	{
		super.onFailed( err );

		alert( err.message );
	}
}
```

Now, first, failed queries that related to the `Post` model will be logged to the console and then an alert dialog will be displayed.

Restorm currently doesn't support a way to explicitly removing event listeners that inherited from parent models. But at least, we can overwrite them and left it's body empty. With that way, the listener will still be there and it will be triggered but with no effect.

## Events List
| Event Name      | When |
| --------------- | ---- |
| `waiting`       | request is initiated and waiting for the response |
| `success`       | request was successful with a status code >= 300 range |
| `failed`        | request was failed with a status code that is not in the 2xx range |
| `finished`      | request is finished, regardless of its outcome |
| `canceled`      | request is canceled by Restorm or the user |
| `paginated`     | request is finished, pagination is ready |
| `network-error` | request failed due to a network level error |
| [StatusCodes]   | request is finished and the server responds with the corresponding status code. For example, if the server responds with a 404 status code, the `404` event is triggered. |

# Collections
Restorm provides a structure for handling a set of model instances.

It implements array interface. That means we can use a collection like an array, put it into a `for` loops, `Array.from(collection)` or `[...collection]`.

Moreover, the `Collection` class's prototype is behind a Proxy. This way, we can use short array syntax and get items like `posts[2]`.

Collections methods will never return arrays. Instead, they will always return `Collection` instances which encapsulate those arrays. With this behavior, we can say collections are immutable.

## Getting a Collection
The `all` method returns a promise that will be fulfilled with a collection of model instances.

```js
const posts = await Post.all();
```

Now, we have a model collection baked by Restorm. Let's see what we can do with it.

## Getting Collection Size
We can get the size of the collection using `size` property. It's a read only property.

```js
console.log( posts.size );
```

Also, we can use `length` property instead.

```js
console.log( posts.length );
```

## First Item
We can easily grab the first item of the collection.

```js
console.log( posts.first());
```

Array syntax is also supported.

```js
console.log( posts[ 0 ]);
```

It returns a `Model` or `undefined` if the collection is empty.

## Last Item
Getting the last item is easy as well as getting the first item.

```js
console.log( posts.last());
// Model or undefined
```

With array syntax we can get the last item.

```js
console.log( posts[ posts.length - 1 ]);
```

## Get Item by Position
If we want to get an item by its position in the collection, we can use `get` method.

```js
console.log( posts.get( 3 ));
```

It returns a `Model` or `undefined` if the position is out of bounds.

With array syntax:

```js
console.log( posts[ 3 ]);
```

## Array Methods
We can use all the array methods on collections. The return value will always be a collection. That makes the collections immutable.

```js
const titles = posts.map( post => post.title );

// titles is a new collection
console.log( titles.last());
```

If the array method we used is kind of a doesn't return anything, it will return the collection we're working on.

```js
const size = posts
	.forEach( console.log )
	.size();
```

## Looping
We can use all the array looping methods on collections or we just can use `for` loops.

```js
posts
	.pluck( "title" )
	.filter( title => title.startsWith( "Hello" ))
	.map( title => title.toUpperCase())
	.forEach( console.log );
```

Or we can use `for` loops.

```js
for ( const post of posts )
{
	if( post.title.startsWith( "Hello" ))
	{
		post.title = post.title.toUpperCase();
		console.log( post.title );
	}
}
```

## Plucking
Sometimes we need only a specific field from the model. We can use the `pluck` method to collect those fields and get them as a brand new collection.

```js
const titles = posts.pluck( "title" );

console.log( titles.last());
```

## Converting to Array
If we need to convert the collection to an plain array, we have a few options.

### Array.from
Every collection carries an iterator interface on it.

```js
console.log( Array.from( posts ));
```

It will kick iterator interface and collects all the items as an array. But this will be slow because it uses loop under the hood.

### [...collection]
We can use the spread operator to convert the collection to an array.

```js
console.log([ ...posts ]);
```

Behind the scenes, it also uses the iterator interface. So, the same scenario will be in action like above.

### Collection.toArray() or Collection.data
Since we already hold the initial list in the collection on the `data` property as a plain array, the only thing we need to do is just return it. `toArray` method just does that.

```js
console.log( posts.toArray());
```

We can also access `data` property directly but it's not recommended. We may make it private in the future or something like that.

```js
// might work, but don't do this
console.log( posts.data );
```

## Converting to JSON
Sometimes we need to convert the collection and the data to JSON as a whole. `toJson` method will do it for us.

```js
console.log( posts.toJson());
```

And the result will be like:

```json
[
	{
		"id": 1,
		"title": "Post 1"
	},
	{
		"id": 2,
		"title": "Post 2"
	}
]
```
