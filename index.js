const Koa = require('koa')
const { ApolloServer } = require('apollo-server-koa')
const { Storage } = require('@google-cloud/storage')
const typeDefs = require('./typeDefs')

const { PORT, NODE_ENV } = process.env

const init = async () => {
  let data

  console.log(`Node environment: ${NODE_ENV || 'development'}`)

  if ('production' === NODE_ENV) {
    const storage = new Storage({
      projectId: 'ensplorer',
    })

    const myBucket = storage.bucket('ensplorer.appspot.com')
    const file = myBucket.file('dump.json')
    console.log(`Loading data dump from GCS...`)
    const rawData = await file.download()
    data = JSON.parse(rawData.toString('utf-8'))

  } else {
    data = require('./data/dump.json')
  }
  if (!data.addresses || !data.nodes) {
    console.error('Invalid data')
    console.error(data)
    return process.exit(1)
  }
  console.log(`Loaded data dump. ${Object.keys(data.addresses).length} addresses and ${Object.keys(data.nodes).length}.`)

  const resolvers = require('./resolvers')(data)

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  })

  const app = new Koa()
  server.applyMiddleware({ app })

  app.listen({ port: PORT || 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`),
  )
}

init().catch(err => {
  console.error(err)

  process.exit(-1)
})
