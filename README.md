# Introduction
Restorm is a lightweight JavaScript library designed to streamline the process of handling RESTful services within client-side applications. With Restorm, we can easily model data on the client side and interact with RESTful APIs by adhering to predefined rules and conventions.

This library simplifies the communication process between the client and server, abstracting away the complexities of HTTP requests and allowing developers to focus on building robust, scalable applications. Whether you're fetching data, creating new resources, or updating existing ones, Restorm provides a seamless interface for performing CRUD operations while ensuring compliance with RESTful principles.

With its intuitive design and flexible configuration options, Restorm empowers developers to efficiently integrate RESTful services into their JavaScript applications, enhancing productivity and promoting best practices in web development.

# Installation
To install Restorm, you can use npm:

```
npm install restorm
```

## Vue

Set up on `src/models`.

```js
// base-model.js
import { Model } from "restorm";

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

# Building the Query
After preparing our models, we can create RESTful requests with them.

## Retreiving a List of Resources
The `all` method returns a promise.

Upon the request being fulfilled, the list of resources sent by the server is instantiated with the `Post` model. These instances are then placed into a `collection`, which is filled into the awaiting promise.

```js
const posts = await Post.all();
```

```
GET /api/v1.0/posts
```

## Retrieving a Single Resource
There are two main methods that enable us to obtain a single resource.

* `first` - Get the first resource in a resource collection.
* `find` - Find a specific resource based on the primary key.

### Getting the First Resource
The `first` method creates a request to the root directory of resources with filtering criteria, and it requests the first item of the first page of the results found.

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

## Filtering Resources
To list specific resources, we add filters with `where` method to accomplish this.

We can directly filter represented resources by models:

```js
const posts = await Post.where( "type", "article" ).get();
```

```
GET /api/v1.0/posts?filter[type]=article
```

### Filtering Related Resource
Restorm may request the inclusion of another resource related with the resources it will receive. We'll see this later.

If the related resource is multiple (i.e., one-to-many), we can also indirectly add filters to these sub-resources.

```js
const posts = await Post
	.where( "type", "article" )
	.where( "comments.state", "approved" )
	// or
	.where([ "comments", "state" ], "approved" )
	.get();
```

```
GET /api/v1.0/posts?filter[type]=article&filter[comments.state]=approved
```

### Object Syntax
We can perform these operations in a more organized and concise manner through object syntax, providing a cleaner and more streamlined usage.

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

const posts = await Post.where( conditions ).get();
```

```
GET /api/v1.0/posts?filter[type]=article&filter[comments.state]=approved
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
We can also subject the associated model to the sorting process.

```js
const posts = await Post
	.orderBy( "comments.id", "desc" );
	// or
	.orderBy([ "comments", "id" ], "desc" );
	.all();
```

```
GET /api/v1.0/posts?sort[comments.id]=desc
```

### Object Syntax
We can use object syntax to organize sorting operations. This approach is more concise and organized and for example, if we are using something like vue.js or react.js, we can manage sorting operations on reactive objects and directly pass this object to the `orderBy` method.

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
		id: "desc"
	}
}

const posts = await Post.orderBy( sorting ).get();
```

```
GET /api/v1.0/posts?sort[updated_at]=desc&sort[created_at]=asc&sort[comments.id]=desc
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

### Including Nested Relationships
We can even include nested relationships. That means we can include the related resources of the related resources and so on.

```js
const posts = await Post
	.with( "comments.author" )
	.all();
```

```
GET /api/v1.0/posts?with=comments.author
```

Server should return the following response:

```json
[
	{
		"id": 1,
		"post": "lorem ipsum",
		"comments":
		[
		    {
		        "id": 1,
		        "comment": "lorem ipsum",
		        "author":
		        {
		            "id": 1,
		            "name": "John Doe"
		        }
		    }
		]
	}
]
```
