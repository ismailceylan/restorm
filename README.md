
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

We can safely use `Collection` and `Array` specific methods on the result.

```js
const latestPostTitle = posts.map( post => post.title ).last();
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

The `Collection` extends native Array. So we can say that collections a specialized type of array. We will learn more about it in the next sections.

We could easily use Array approach as well to accomplish the same result.

```js
if( Array.isArray( result ))
{
	result.forEach( post =>
		console.log( post.id )
	);
}
```

## Retrieving a Single Resource
There are three methods that enable us to obtain a single resource.

* `first` - Get the first resource in a resource collection.
* `find` - Find a specific resource based on the primary key.
* `get` - Get all resources as collection or a single resource model.

### Getting the First Resource
The `first` method creates a request to the root directory of resources with filtering criteria, and it requests the first item of the results found.

The returned promise will be fulfilled with an instance created from the Post model.

```js
const post = await Post.first();
```

```
GET /api/v1.0/posts?limit=1
```

### Finding an Exact Resource By Primary Key
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
const result = await Post.where( conditions ).get();

if( result instanceof Post )
{
	console.log( result.title );
}
```

```
GET /api/v1.0/posts
```

## Including Relationships
The `with` method is used to include related resource to a model. This process is known as eager loading. We can provide as many relationship names as arguments to the method or as an array.

We can directly include a related resource by its name to the model:

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
To list specific resources, we add filters with `where` and various methods like `whereNull`, `whereNotNull`, `whereBetween`, `whereNotBetween`, `whereIn`, `whereNotIn` to accomplish this.

All the alternative methods listed above are implemented by `where` method under the hood.

`where` method has 3 arguments. `target`, `operator` and `filter`. The first one is the name of the field, the second one is the operator and the third one is the filtering criteria. The operator is the optional one.

We can directly filter represented resources by models:

```js
const articles = await Post.where( "type", "article" ).all();
```

```
GET /api/v1.0/posts?filter[type]=eq:article
```

If no operator is specified, the given criteria value type will be checked. If the given value is an array, the operator will be assumed as `in` and the filtering attempt will be transformed into a `whereIn`. If the given value is not an array, the operator will be assumed as `equal` and items that match exactly the given value will be filtered out.

These three filters are equal to each other:

```js
Post.where( "type", "article" );
Post.where( "type", "=", "article" );
Post.where( "type", "equal", "article" );
```

These are also equal to each other:

```js
Post.where( "id", [ 10, 20, 30 ]);
// or more explicitly
Post.where( "id", "in" [ 10, 20, 30 ]);
// or with the dedicated method
Post.whereIn( "id", [ 10, 20, 30 ]);
```

### Supported Comparison Operators
Restorm supports the following comparison operators in the `where` methods:

| Operator     | Alternative | Encapsulating Method | Description |
| ------------ | ----------- | -------------------- | ----------- |
| `equal`      | `=`         | `where` | match exactly |
| `notequal`   | `!=` `<>`   | `where` | don't match the given value |
| `less`       | `<`         | `where` | smaller than the given value |
| `great`      | `>`         | `where` | greater than the given value |
| `lesseq`     | `<=`        | `where` | equal or smaller than the given value |
| `greateq`    | `>=`        | `where` | equal or greater than the given value |
| `between`    | `><`        | `where` `whereBetween` | fall between two given values |
| `notbetween` | `>!<`       | `where` `whereNotBetween` | don't fall between two given values |
| `in`         | `...`       | `where` `whereIn` | match exactly with the given multiple values |
| `notin`      | `.!.`       | `where` `whereNotIn` | don't match with the given multiple values |
| `like`       | `~`         | `where` | match if the given value containing |
| `notlike`    | `!~`        | `where` | don't contain the given value |
| `null`       | `=n`        | `where` `whereNull` | match if it's empty |
| `notnull`    | `!n`        | `where` `whereNotNull` | match if it's not empty |

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
GET /api/v1.0/posts?with=comments&filter[type]=eq:article&filter[comments.state]=eq:approved
```

We could also use operators with them.

```js
Post.where( "comments.state", "notin", [ "owner-removed", "banned" ]);
// or with dedicated method
Post.whereNotIn( "comments.state", [ "owner-removed", "banned" ]);
```

```
GET /api/v1.0/posts?filter[comments.state]=nin:owner-removed,banned
```

With that filter, we could get all the comments that if their state not `owner-removed` and not `banned`.

### Object Syntax
We can perform these operations in a more organized and concise manner through object syntax, providing a cleaner and more streamlined usage. For example, if we are using something like vue.js, we can manage operations on reactive objects and directly pass this object to the `where` method.

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
GET /api/v1.0/posts?with=comments&filter[type]=eq:article&filter[comments.state]=eq:approved
```

As you noticed, we doesn't have a way to apply operators on object syntax currently. The operator is defaultly assumed to be `equal` for the object syntax. Maybe we can improve it in the future.

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
The `limit` method is used to specify the number of items per request.

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

```
GET /api/v1.0/posts?limit=10&page=1
GET /api/v1.0/posts?limit=10&page=2
```

We requested the first and second page and got the first and second 10 posts simultaneously.

As you realized, we paginated resources without knowing the total number of items and pages. It's kind of a blind process but more performant than if we knew them upfront.

### Length-Aware Pagination
The `paginate` method can handle the pagination process that we have been doing manually and adds some extra features to it.

This method returns a `LengthAwarePaginator` instance which it extends our `Collection` class. We will see soon what collections can do but for now, that makes it an advanced collection that can be used to get the total number of items, current page, items per page, total number of pages, request the next page with ease and of course get the items.

```js
const paginator = await Post.paginate();
```

```
GET /api/v1.0/posts?limit=10&page=1&paginate=length-aware
```

`paginate` method takes only one argument to set page number up front. This could help us to continue where we left off. 

```js
const paginator = await Post.paginate( 18 );
```

```
GET /api/v1.0/posts?limit=10&page=18&paginate=length-aware
```

Querying the next page with `next` method, as we will see in the next sections will increase the page number from the value we provided in the `paginate` method.

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
Nowadays, RESTful APIs can provide various types of pagination metadata depending on the frameworks, libraries, and who created the API. The `Page` class normalizes this metadatas into a consistent format. But we need to specify which information corresponds to which attribute and distribute them properly.

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
GET /api/v1.0/posts?filter[author_id]=eq:481516
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

### Extending Current Resource
Sometimes, we might want to extend the current resource some additions. To achieve this, we can use the `from` method with a callback function. Restorm will pass the current resource as the first argument to the callback. We should return calculated resource back from it.

```js
const posts = await Post
	.from( resource => resource + "/most-popular-of-the-month" )
	.all();
```

```
GET /api/v1.0/posts/most-popular-of-the-month?limit=10
```

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

In real world, reactions would belong to posts, comments, and even personal messages. Defining a static resource name in the reactions model wouldn't work in this case. This is where the `from` method shines.

## Casting
Sometimes, we might want to cast the result of the query to a different type. To do this, restorm provides the `cast` method.

This method has two overloads: First, it can register a caster for single field. Second, it can register a caster for all fields in the model at once.

```js
const posts = await Post
	.cast( "price", value => parseFloat( value ))
	.find( 12 );

console.log( posts.price );
// 12.99
```

It also can register casters with an object at once.

```js
const modifiers =
{
	post: value => markdown( value ),
	colors: value => value.split( "," ),
	price( value )
	{
		return parseFloat( value )
	}
}

const posts = await Post.cast( modidifiers ).find( 12 );

console.log( posts.price, posts.post );
// 12.99
// [red, green, blue]
// Hello <b>World!</b>.
```

# CRUD Operations
Restorm provides a set of methods that allow us to perform CRUD operations on RESTful resources, and we have seen above how to handle the `(R)ead` side by `get`, `all`, `find`, `first` methods.

So let's see how to perform `(C)reate`, `(U)pdate` and `(D)elete` operations.

## Create
On HTTP protocol, a resource creation should be performed by sending a `POST` request to the RESTful api endpoints.

We designed a few alternative ways to create resources.

### Instantiating The Model And Posting
Restorm allows us to create resources as model instances and post them.

First, we need to create a model instance. Let's create a new instance of `Article` model.

```js
const title = "Elon Musk went to the Moon instead of Mars";
const content = "Yeah! You heard right, he did just like that! Unbelievable.";

const draft = new Article({ title });
```

Now, we have an instance of `Article` model and the data setted on it. It currently doesn't have any id because it is a new resource and hasn't been saved yet.

Assigning missed properties to the model instance at this moment is possible.

```js
draft.content = content;
```

Now we are ready to post it. We can explicitly post the model instance with the `post` method.

```js
const article = await draft.post();
```

```
POST /api/v1.0/articles
```

`post` method returns a never rejecting promise that will be fulfilled with an instance of `Article` model or an `Error` if there is an issue about the network or server side.

```js
if( article instanceof Article )
{
	console.log( article.id );
	// 2
}
```

### Statically Posting
Restorm also provides a static `post` method on models. That means we don't have to create a model instance to post a resource.

```js
const article = await Article.post(
{
	title: "Elon Musk went to the Moon instead of Mars",
	content: "Yeah! You heard right, he did just like that! Unbelievable."
});

console.log( article.id );
// 2
```

```
POST /api/v1.0/articles
```

The result should look like this:

```json
{
	"id": 2,
	"title": "Elon Musk went to the Moon instead of Mars",
	"content": "Yeah! You heard right, he did just like that! Unbelievable."
}
```

## Update
We can update an existing resource by sending a `PATCH` or `PUT` request to api endpoints.

As you know already the `PUT` is used to update an existing resource as a whole. That means, missing properties should convert to `null` or default values on the database.

The `PATCH` on the other hand, is used to update only some of the properties of the resource and missing properties will be stay as they are. This is what makes `PATCH` lightweight compared to `PUT`.

### PATCH
Restorm smart enough to know which properties of the model you modified and that gives us an opportunity to send just the modified properties when you used `PATCH` method.

First of all we have to grab the remote resource as a model.
```js
const article = await Article.find( 1 );
```

Now we can modify the resource on the fly.
```js
article.title = "Jeff Bezos went to the Moon instead of Mars";
```

And now, we can sync local changes to the server.
```js
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

### PUT
Sometimes we really might want to send a `PUT` request. We can do that by using the `put` method of Restorm.

```js
const state =
{
	title: "Jeff Bezos went to the Moon instead of Mars"
}

// we can request the resource as a model from the endpoint
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

## Handling Network and Server Errors
The Restorm won't throw `Error` or reject the promise when there are network or server errors. That means you can't catch them with `try-catch` or `then-catch` mechanism. Restorm will supress throwing all the HTTP errors with 400 and 500 status codes and network errors as well.

If you want to handle these kinds of errors, you can add event listeners to your queries or models, or you can handle them manually at that very moment when they are resolved by the `post` method.

```js
if( article instanceof Error )
{
	console.log( "network or server errors", article );
}
```

If Restorm detects issues with the usage of its methods, it will throw an error and stop your application. You shouldn't catch and handle these kind of errors manually or suppress them; you need to resolve and eliminate them.

# Event Management
Restorm provides an event management system to handle network errors, server errors and internal events. 

We can bind event listeners to our queries, models or model instances. Events are kind of hooks that will be triggered when certain events happen.

Since Restorm have this mechanism, it doesn't need to throw network and server errors. Restorm only throws runtime errors. So that means network errors and 400-500 errors will be suppressed and won't stop the application. We should grab and handle them manually.

We can register our listeners with `on` method.

Multiple event listeners can be added for a single event. The bound event listeners will be executed in the order they were bound when the event occurs.

## QueryBuilder Event Binding
```js
const post1 = await Post.on( "failed", gettingPostFailed ).find( 1 );
const post2 = await Post.find( 2 );

function gettingPostFailed( err )
{
	console.log( err )
}
```

Note that if the `on` method on the models called statically just like the above, it will create a `QueryBuilder` instance internally, binds the event listener we passed to it and returns query builder instance.

The event listeners that bound to a `QueryBuilder` will be effective only for that specific query builder instance.

The first query will print the error object in the console when the api endpoint returns an 400, 500 http status code or a network error happens. But the second query won't log anything even if it has an error because it's running on a different query builder instance and we didn't bind any event listener to it.

We can easily remove the event listeners by using `off` method but we should extract the `QueryBuilder` instance when using static `on` method of a model.

```js
const queryBuilder = Post.on( "failed", gettingPostFailed );
const post1 = await queryBuilder.find( 1 );

queryBuilder.off( "failed", gettingPostFailed );

const post2 = await queryBuilder.find( 2 );
```

Even if the second attempt has an error, it won't be logged because we unbound the event listener from it.

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

// we can make changes step by step
post.title = "Lorem ipsum";
post.on( 304, postNotModified );

await post.patch();

// we can remove the event listener
post.off( 304, postNotModified );

function postNotModified( post, response, data )
{
	console.log ( post );

	// this word refers to QueryBuilder instance
	console.log( this );
}
```

This time, the `on` method is not static. It operates on the context of the model that represents the resource and every model has its own query builder instance. It will bind the event listener we provided to the query builder that under the hood and return the model's itself, so we can chain. After that, patching happened over the same `QueryBuilder` instance.

We removed the event listener by using `off` method right after the patch request complete. But we could also use `once` property to make event listener to run only once. With that we couldn't need to unbind the event listener manually.

We could write same code more compactly like this:

```js
await ( await Post.find( 1 ))
	.on( 304, console.log, { once: true })
	.patch({ title: "Lorem ipsum" });
```

Yet even that would send two requests to the server and not error safe (find process can return an error object). To reduce the number of requests and be error safe we can rewrite it like this:

```js
await Post
	.on( 304, console.log, { once: true })
	.patch( 1, { title: "Lorem ipsum" });
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
| Event Name           | When |
| :------------------- | :--- |
| `waiting`            | request is initiated and waiting for the response |
| `success`            | request was successful with a status code 200-299 range |
| `failed`             | request was failed with a status code that is in the 400-599 range |
| `finished`           | request is finished, regardless of its outcome |
| `canceled`           | request is canceled by Restorm or the user before it finished |
| `paginated`          | request is finished, pagination is ready |
| `network-error`      | request failed due to a network level error |
| `client-bad-request` | request failed due to bad request at client side (it's not same 400 status code) |
| `[StatusCodes]`      | request is finished and the server responds with the corresponding status code. For example, if the server responds with a 404 status code, the `404` event is triggered. |

# Collections
Restorm provides a structure for handling a set of model instances. We prefer to call it a collection. It extends native `Array` constructor. So we can say that collections a specialized type of array.

We can use all the methods that we use on arrays. But note that methods like `map` or `filter`, which return an array when used on arrays, will return a collection instead of an array since it's a collection anyway.

## Getting a Collection
The `all` method returns a promise that will be fulfilled with a collection of model instances.

```js
const posts = await Post.all();
```

Now, we have a collection that holds models baked by Restorm. Let's see what we can do with it.

## First Item
We can easily grab the first item of the collection.

```js
console.log( posts.first());
```

## Last Item
Getting the last item is easy as well as getting the first item.

```js
console.log( posts.last());
// item or undefined
```

With array syntax we could use `posts[ posts.length - 1 ]`.

## Contains
We can easily check if the collection contains a specific model by using the model or its primary key.

```js
console.log( posts.contains( post ));
// or
console.log( posts.contains( 1 ));
```

Of course there is no need to mention we can use native `filter` or `find` array method to do more complex analysis to check if the collection contains a specific model.

## Diff
Some cases we might want to take a difference between two collections. We can use the `diff` method to get the difference between two collections.

```js
const items = new Collection( 1, 2, 3, 4 );
const even = new Collection( 2, 4 );
const odd = items.diff( even );

console.log( odd );
// 1, 3
```

Main advantage of the `diff` method is that it knows how to deal with models.

```js
const posts = await Post.all();
const evenIDPosts = await Post.whereIn( "id", [ 2, 4, 6, 8 ]).all();

console.log( posts.diff( evenIDPosts ));
// [{ id: 1, ... }, { id: 3, ... }]
```	

Two collection might contains same resources with different model instances but it didn't matter because of the `diff` method compares the primary keys.

## Plucking
Sometimes we need only a specific field from the models (or objects). We can use the `pluck` method to collect values of those field and get them as a brand new collection.

```js
console.log(
	posts.pluck( "title" ).last()
);
```

## Converting to JSON
Sometimes we need to convert the collection to JSON as a whole. `toJson` method will do it for us.

```js
console.log( posts.toJson());
// equivalent to
console.log( JSON.stringify( posts ));
```

## Array Methods
We can easily use array methods on the collection.

For example, let's say we want to get the first 5 models from the collection. We can use `slice` method to achieve that.

```js
console.log(
	posts.slice( 0, 5 ).pluck( "id" )
);
// 1, 2, 3, 4, 5
```

As you see, slice method returns a collection.

Also, there are other array methods like `sort`, `push`, `pop`, `shift`, and `unshift` that mutate the array. We didn't touch that convention here. They will mutate the collection.
