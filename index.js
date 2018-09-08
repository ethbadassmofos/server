const Koa = require('koa')
const { ApolloServer } = require('apollo-server-koa')
const { Storage } = require('@google-cloud/storage')
const typeDefs = require('./typeDefs')

const { PORT, NODE_ENV } = process.env

console.log(`Node environment: ${NODE_ENV || 'development'}`)

const inProduction = ('production' === NODE_ENV)

const init = async () => {
  let data
  let dataReady = false

  if (inProduction) {
    const storage = new Storage({
      projectId: 'ensplorer',
    })

    console.log(`Loading data dump...`)

    const myBucket = storage.bucket('ensplorer.appspot.com')
    const file = myBucket.file('dump.json')

    const strBuffer = ''

    file.createReadStream()
      .on('error', err => {
        console.error('Error download dump', err)
        process.exit(-1)
      })
      .on('response', res => {
        console.log('Connected to bucket, download....')
      })
      .on('data', data => {
        strBuffer += data.toString()
      })
      .on('end', () => {
        try {
          data = JSON.parse(buffer)
        } catch (err) {
          console.error('Error parsing dump', err)
          process.exit(-1)
        }

        dataReady = true
      })
  }

  if (!data && !inProduction) {
    data = require('./data/dump.json')
    dataReady = true
  }
  if (!data.addresses || !data.nodes) {
    console.error('Invalid data')
    console.error(data)
    return process.exit(1)
  }
  console.log(`Loaded data dump. ${Object.keys(data.addresses).length} addresses and ${Object.keys(data.nodes).length}.`)

  const typeDefs = require('./typeDefs')
  const resolvers = require('./resolvers')(() => data)

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  })

  const app = new Koa()

  app.use(async ({ response }, next) => {
    if (!dataReady) {
      response.type = 'text/plain';
      response.body = 'Data not yet ready!';
    } else {
      await next()
    }
  })

  server.applyMiddleware({ app })

  app.listen({ port: PORT || 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`),
  )
}

init().catch(err => {
  console.error(err)

  process.exit(-1)
})
