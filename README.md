# GraphQL MockFiles Server

A GraphQL mockserver based on files and a typeDefinition

## Getting started

This is a mockserver that can be used as
[expressjs middleware](https://expressjs.com/en/guide/using-middleware.html). It
serves mocks based on
[GraphQL typeDef](./graphql-mocks/graphql-mock-schema.graphql) and a query
posted to the server.

Make your GraphQL typeDef:

```graphql
type Query {
  posts: [Post]
}
type Post {
  title: String
  content: String
  date: Date
}
```

And your express server:

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
    createGraphQlMockfilesMiddleware(
      graphqlTypeDefs,
      path.resolve(__dirname, './graphql-mocks')
    )
  );
  app.listen(3000, () =>
    console.log('graphQlMockServer launched at localhost:3000')
  );
}
main();
```

Now execute a query by posting to the server using your
[favorite GraphQL client](https://altair.sirmuel.design/)
