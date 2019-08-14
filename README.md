# GraphQL MockFiles Server

A GraphQL mockserver based on files and a typeDefinition

## Getting started

This is a mockserver that can be used as
[expressjs middleware](https://expressjs.com/en/guide/using-middleware.html). It
serves mocks based on
[GraphQL type definitions](./graphql-mocks/graphql-mock-schema.graphql) and a
query posted to the server. It can handle
[aliases](https://graphql.org/learn/queries/#aliases).

> Be aware that this mock-middleware currently does not support
> [mutations](https://graphql.org/learn/queries/#mutations). It could be added
> in the future

### Prepare your mockfiles

To make sure the mockserver can provide you with content to your queries,
prepare your directory that contains the responses. The names of each response
needs to be `ok.json`.

Let's take this GraphQL type definition as an example.

```graphql
type Query {
  posts: [Post]
}
type Post {
  title: String
  content: String
  date: Date
  author: Author
}
type Author {
  name: String
}
```

So this typedef would result in the following directory structure:

```
mocks/posts/ok.json
[
  {
    "title": "A great post",
    "content": "Lorem ipsum dolor sit amet, [...]",
    "dateCreated": "2019-08-13T15:21:37.978Z"
  },
  {
    "title": "Another post",
    "content": "Suspendisse lectus ligula, pharetra [...]",
    "dateCreated": "2019-08-11T12:21:03.23Z"
  }
]
```

```
mocks/posts/author/ok.json
{
  "name": "Albert"
}
```

Now setup the express server to serve the mockfiles. Take your typeDefs and the
path and pass it to the mock-middleware:

```js
const bodyParser = require('body-parser');
const path = require('path');
const app = require('express')();

const {
  createGraphQlMockfilesMiddleware,
} = require('graphql-mockfiles-express-middleware');

function main() {
  const graphqlTypeDefs = `
    type Query {
      hello: String
      me: Me
    }

    type Me {
      posts: [Post]
    }

    type Post {
      title: String
      content: String
      dateCreated: String
    }`;

  app.use(bodyParser.json());
  app.use(
    '/graphql',
    // =====================> Mock Middleware
    createGraphQlMockfilesMiddleware(
      graphqlTypeDefs,
      path.resolve(__dirname, './graphql-mocks')
    )
    // =====================> End Mock Middleware
  );
  app.listen(3000, () =>
    console.log('graphQlMockServer launched at localhost:3000')
  );
}
main();
```

Now, when executing a query you'd get the results from the mockserver from the
files:

```graphql
{
  posts {
    title
    author {
      name
    }
  }
}
```

Gives:

```json
{
  "data": {
    "posts": [
      { "title": "A great post", "author": { "name": "Albert" } },
      { "title": "Another post", "author": { "name": "Albert" } }
    ]
  }
}
```

Now execute a query by posting to the server using your
[favorite GraphQL client](https://altair.sirmuel.design/)

![GraphQL Mockserver Client](./assets/graphql-client.png)

# How does it work

The middleware requires you to give typeDefs and the path to the mock directory.
Then each request it basically generates a new middleware based on the response
of the paths of your separate
