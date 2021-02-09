// linking express
const express = require('express');
// linking apollo
const { ApolloServer } = require('apollo-server-express');
// linking path
const path = require('path');

// linking and destructoring schemas
const { typeDefs, resolvers } = require('./schemas');
// linking auth 
const { authMiddleware } = require('./utils/auth');
// linking connections js
const db = require('./config/connection');

// establishing port
const PORT = process.env.PORT || 3001;
// establishing app
const app = express();
// initiaing apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});


server.applyMiddleware({ app });

// preventing rewrite
app.use(express.urlencoded({ extended: false }));
// extending app to json format
app.use(express.json());

// Serve up static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
});