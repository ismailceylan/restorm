# INTRODUCTION
Restorm is a lightweight JavaScript library designed to streamline the process of handling RESTful services within client-side applications. With Restorm, we can easily model data on the client side and interact with RESTful APIs by adhering to predefined rules and conventions.

This library simplifies the communication process between the client and server, abstracting away the complexities of HTTP requests and allowing developers to focus on building robust, scalable applications. Whether you're fetching data, creating new resources, or updating existing ones, Restorm provides a well known interface for performing CRUD operations while ensuring compliance with RESTful principles.

With its intuitive design and flexible configuration options, Restorm empowers developers to efficiently integrate RESTful services into their JavaScript applications, enhancing productivity and promoting best practices in web development.

# INSTALLATION
To install Restorm, you can use npm:

```
npm install restorm
```

# INITIALIZATION

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

# BUILDING THE QUERY
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
We can perform these operations in a more organized and concise manner through object syntax, providing a cleaner and more streamlined usage. For example, if we are using something like vue.js or react.js, we can manage sorting operations on reactive objects and directly pass this object to the `where` method.

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

If the limit value we are going to use is the same most of the time, we can define it in the model instead of using the `limit` method every time.

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

### Advanced Pagination
The `paginate` method can handle the pagination process that we have been doing manually and adds some extra features to it.

This method returns a `LengthAwarePaginator` instance which it extends our `Collection` class. That makes it an advanced collection that can be used to get the total number of items, current page, items per page, total number of pages, request the next page with ease and of course get the items. We will see soon what collections can do.

```js
const paginator = await Post.paginate();
```

```
GET /api/v1.0/posts?limit=10&page=1&paginate=length-aware
```

#### Pagination Metadata
The `LengthAwarePaginator` has a property named `page` which holds a `Page` instance. If the Rest API has included pagination metadata in its responses, this information is abstracted with the `Page` class, and we can access it through the paginator.

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
The `end` property is a flag that indicates if the pagination is at the end and there are no more items to be fetched.

```js
const { end } = paginator.page;
```

#### Normalizing Metadata
Rest APIs can provide various types of pagination metadata. The `Page` class normalizes this metadata into a consistent format, but we need to specify which information corresponds to which attribute and distribute them properly.

We achieve this by defining a static method called `$pluckPaginations` on the model. Restorm invokes this method by passing the body of the response sent by the Rest API and the `Page` instance through the argument tunnel. We should then use these objects to ensure the necessary distribution.

For example, while our post data may be provided through Django, our user data may be powered by Laravel. In those kind of cases, we can define the mentioned function separately in the `Post` model and the `User` model. Otherwise if all our data is being fed by the same framework, we can write it once in the `BaseModel`.

```js
// models/base-model.js
import { Model } from "restorm";

class BaseModel extends Model
{
	static $pluckPaginations( responseBody, page )
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

There is no need to track the current page number, as Restorm will handle this for us.

Additionally, Restorm keeps track of whether requests have been completed or not. When the `next` method is called, if there is still a pending request awaiting response, the call is ignored. We don't need to deal with such matters.

```js
paginator.next();
```

## Conditional Queries
Sometimes, we might want to add a constraint to our query. To do this, we can use the `when` method. The first argument is a boolean expression, and the second is a callback function. The callback will receive query builder instance and the condition flag's value as arguments.

```js
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

const posts = await Post
	.when( getUserId(), ( query, userId ) =>
		query.where( "author_id", userId )
	)
	.get();
```

```
GET /api/v1.0/posts?filter[author_id]=481516
```

You have to be careful with falsy values. For example, if you pass `0` as an user ID, it will be considered as `false`, and the query will not be executed.

## Additional Params
Sometimes, we might want to pass additional parameters to the query that restorm doesn't pass explicitly.

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

### Model Aware Custom Resource
Sometimes, we might want to build dynamic resource URIs depending on some model instances that we have already.

```js
const post = new Post({ id: 48 });
const comment = new Comment({ id: 4815, post_id: post.id });
const reactions = await Post.from( post, comment, "reactions" ).all();
```

```
GET /api/v1.0/posts/48/comments/4815/reactions
```

# CRUD OPERATIONS
Restorm provides a set of methods that allow us to perform CRUD operations on RESTful resources, and we have seen above how to handle the `(R)ead` side by `get`, `all`, `find`, `first` methods.

So let's see how to perform `(C)reate`, `(U)pdate` and `(D)elete` operations.

## Create
On Http protocol, creation is done by sending a `POST` or some cases `PUT` request to the RESTful endpoints.

```js
const newPost = new Post(
{
	title: "Elon Musk went to the Moon instead Mars",
	content: "Yeah! You heard right, he did just like that! Unbelievable."
});

newPost.save();
// or
newPost.post();
```

```
POST /api/v1.0/posts
```

The `post` method is very self-explanatory, it just sends a `POST` request to the resource endpoint but the `save` method has something magical behind it.

If the primary key is not set, it will send a `POST` request to the resource endpoint, otherwise it will send a `PUT` request. That means it can handle creation and updating of resources.
