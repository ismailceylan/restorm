# Introduction
Restorm is a lightweight JavaScript library designed to streamline the process of handling RESTful services within client-side applications. With Restorm, developers can easily model their data on the client side and interact with RESTful APIs by adhering to predefined rules and conventions.

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
// user.js
import { BaseModel } from ".";

export default class User extends BaseModel
{
	resource = "users";
}
```

# Building the Query
After preparing your models, we can create RESTful requests with them.

## Retreiving a List of Resources
The 'all' method returns a promise.

Upon the request being fulfilled, the list of resources sent by the server is instantiated with the Post model. These instances are then placed into a collection, which is filled into the awaiting promise."

```js
const posts = await Post.all();
```

```wget
GET /api/v1.0/posts
```

## Retrieving a Single Resource
There are two main methods that enable us to obtain a single resource.

* `first` - Get the first resource in a resource collection.
* `find` - Find a specific resource based on the primary key.

### Getting the First Resource
The `first` method creates a request to the root directory of resources with filtering criteria, and it requests the first item of the first page of the results found. Which makes it a specific type of `get` method.

The returned promise is fulfilled with an instance created from the Post model.

```js
const mostViewedPost = await Post.orderBy( "views", "desc" ).first();
```

```wget
GET /api/v1.0/posts?sort[views]=desc&page=1&limit=1
```

### Finding a Specific Resource
The `find` method creates a request to access a resource under the root directory of resources using its primary key value.

```js
const post = await Post.find( 1 );
```

```wget
GET /api/v1.0/posts/1
```
