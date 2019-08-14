#!/usr/bin/env node

const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs-extra');
const app = require('express')();
const {
  createGraphQlMockfilesMiddleware,
} = require('./graphql-mockfiles-middleware');

function main() {
  app.use(bodyParser.json());
  app.use(
    '/graphql',
    createGraphQlMockfilesMiddleware(
      fs
        .readFileSync(
          path.resolve(__dirname, './graphql-mocks/graphql-mock-schema.graphql')
        )
        .toString(),
      path.resolve(__dirname, './graphql-mocks')
    )
  );
  app.listen(3000, () =>
    console.log('graphQlMockServer launched at localhost:3000')
  );
}
main();
