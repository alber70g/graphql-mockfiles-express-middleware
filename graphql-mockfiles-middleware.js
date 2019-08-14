const fs = require('fs-extra');
const path = require('path');
const { parse, graphql } = require('graphql');
const { makeExecutableSchema } = require('graphql-tools');
const { getPathsFromAST } = require('graphql-query-path');
const deepmerge = require('deepmerge');
const { setProps } = require('./setProps');

/**
 * Returns a "getMocks(gqlQuery)" function that returns mocks from the mockdir
 * based on the query
 *
 * @param {string} mockDir directory where the mocks are located
 */
const getMocksFactory = (mockDir) => async (query) => {
  const ast = parse(query);
  const queries = getPathsFromAST(ast);
  return queries.reduce(async (acc, curr) => {
    // give each path a trailing slash, to discover mock-files
    const mocks = curr.map((x) => {
      if (!x.endsWith('/')) {
        x += '/';
      }
      return x;
    });

    const res = {};
    for (const mock of mocks) {
      if (!mock) {
        continue;
      }

      const mockPath = path.resolve(path.join(mockDir, mock), 'ok.json');
      if (fs.existsSync(mockPath)) {
        const mockFile = await fs
          .readJson(mockPath)
          .catch((err) => console.error(err));

        const pathParts = mock.split('/').filter((x) => x.length);

        setProps(pathParts, res, mockFile);
      }
    }

    return deepmerge(acc, res);
  }, {});
};

const createResolversFromObject = (obj) => {
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = () => obj[key];
    return acc;
  }, {});
};

/**
 * Create a mock server middleware based on typeDefs and mockDir
 * @param {string} typeDefs GraphQL Type definitions
 * @param {string} mockDir Directory containing mocks for querying
 */
const createGraphQlMockfilesMiddleware = (typeDefs, mockDir) => {
  const getMocks = getMocksFactory(mockDir);
  return async (req, res) => {
    try {
      const query = req.body.query;
      let resolvers = {};
      if (query.indexOf('IntrospectionQuery') === -1) {
        const result = await getMocks(query);
        resolvers = { Query: createResolversFromObject(result) };
      }

      const schema = makeExecutableSchema({
        typeDefs,
        resolvers,
      });

      const gqlRes = await graphql(schema, req.body.query);
      res.send(gqlRes);
    } catch (error) {
      res.send({ error });
    }
  };
};

exports.createGraphQlMockfilesMiddleware = createGraphQlMockfilesMiddleware;
