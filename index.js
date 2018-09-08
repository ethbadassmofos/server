const Koa = require('koa')
const { ApolloServer } = require('apollo-server-koa')
const got = 'got'
const { Storage } = require('@google-cloud/storage')

const { NODE_ENV } = process.env

const init = async () => {
  let data

  console.log(`Node environment: ${NODE_ENV || 'development'}`)

  if ('production' === NODE_ENV) {
    const storage = new Storage({
      projectId: 'ensplorer',
    })

    const myBucket = storage.bucket('ensplorer.appspot.com')
    const file = myBucket.file('dump.json')

    const url = await file.getSignedUrl({ action: 'read' })

    console.log(`Loading data dump from: ${url}`)

    data = await got(url, { type: 'json' })
  }

  if (!data && 'production' !== NODE_ENV) {
    data = require('./data/dump.json')
  }

  const typeDefs = require('./typeDefs')
  const resolvers = require('./resolvers')(data)

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  })

  const app = new Koa()
  server.applyMiddleware({ app })

  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`),
  )
}

init().catch(err => {
  console.error(err)

  process.exit(-1)
})
