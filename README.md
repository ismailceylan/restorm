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
	.with( "comments" )
	.where( "type", "article" )
	.where( "comments.state", "approved" )
	// or
	.where([ "comments", "state" ], "approved" )
	.get();
```

```
GET /api/v1.0/posts?with=comments&filter[type]=article&filter[comments.state]=approved
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

const posts = await Post.with( "comments" ).where( conditions ).get();
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

const posts = await Post.with( "comments" ).orderBy( sorting ).get();
```

```
GET /api/v1.0/posts?with=comments&sort[updated_at]=desc&sort[created_at]=asc&sort[comments.id]=desc
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

This time the posts doesn't have authors, but the comments do.

## Selecting Fields
The `select` method is used to select specific fields from the model. 

We can directly select fields from the model like this:

```js
const posts = await Post.select([ "id", "title", "author_id" ]).get();
```

```
GET /api/v1.0/posts?field[]=id,title,author_id
```

### Selecting Related Resource Fields
We can also select fields from the related resources.

```js
const posts = Post
	.select( "comments", [ "id", "author_id", "comment" ])
	.select([ "comments", "author" ], [ "id", "username" ])
	.get();
```

```
GET /api/v1.0/posts?field[comments]=id,author_id,comment&field[comments.author]=id,username
```

### Object Syntax
We can use object syntax to organize field selection operations. To select fields from the model, we should define an empty key and provide an array of fields as the value.

```js
const selections =
{
    // resource fields
    "": [ "id", "title", "author_id" ],
    // related resource fields
    comments: [ "id", "author_id", "comment" ],
    // deeply related resource fields
    "comments.author": [ "id", "username" ]
}

const posts = Post.select( selections ).all();
```

```
GET /api/v1.0/posts?field[]=id,title,author_id&field[comments]=id,post_id,author,comment&field[comments.reactions]=comment_id,reaction
```

## Pagination
Pagination is a process of dividing a large set of data into smaller and more manageable chunks. Restorm provides basic and advanced pagination support.

### Basic Pagination
We can accomplish this process manually by using the `page` and `limit` methods.

The `page` method is used to specify the page number. The `limit` method is used to specify the number of items per page.

So, let's see how we can use these methods.

#### Page
The `page` method is used to specify the page number.

```js
const posts = await Post.page( 2 ).get();
```

```
GET /api/v1.0/posts?page=2
```

#### Limit
The `limit` method is used to specify the number of items per page.

```js
const posts = await Post.limit( 10 ).get();
```

```
GET /api/v1.0/posts?limit=10
```

If the limit value that we are gonna use is will be same most of the time then we can define it in the model instead of using the `limit` method every time.

```js
class Post extends BaseModel
{
	limit = 10;
}

const posts = await Post.get();
```

```
GET /api/v1.0/posts?limit=10
```

This query would give us the first 10 posts.
