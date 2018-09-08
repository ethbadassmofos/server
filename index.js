const Koa = require('koa')
const { ApolloServer } = require('apollo-server-koa')

const typeDefs = require('./typeDefs')
const resolvers = require('./resolvers')

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const app = new Koa()
server.applyMiddleware({ app })

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`),
)
