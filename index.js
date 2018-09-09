const Koa = require('koa')
const cors = require('@koa/cors')
const { ApolloServer } = require('apollo-server-koa')
const { Storage } = require('@google-cloud/storage')

const typeDefs = require('./typeDefs')
const processRawData = require('./processor')

const { PORT, NODE_ENV } = process.env

console.log(`Node environment: ${NODE_ENV || 'development'}`)

const inProduction = ('production' === NODE_ENV)

const init = async () => {
  let data

  if (inProduction) {
    const storage = new Storage({
      projectId: 'ensplorer',
    })

    console.log(`Loading data dump...`)

    const myBucket = storage.bucket('ensplorer.appspot.com')
    const file = myBucket.file('dump.json')

    let strBuffer = ''

    file.createReadStream()
      .on('error', err => {
        console.error('Error download dump', err)
        process.exit(-1)
      })
      .on('response', res => {
        console.log('Connected to bucket, download....')
      })
      .on('data', bytes => {
        strBuffer += bytes.toString()
      })
      .on('end', () => {
        try {
          data = processRawData(JSON.parse(strBuffer))
        } catch (err) {
          console.error('Error parsing dump', err)
          process.exit(-1)
        }
      })
  }

  if (!data && !inProduction) {
    data = processRawData(require('./data/dump.json'))
  }

  const typeDefs = require('./typeDefs')
  const resolvers = require('./resolvers')(() => data)

  const server = new ApolloServer({
    introspection: true,
    typeDefs,
    resolvers,
  })

  const app = new Koa()

  app.use(cors({
    origin: '*',
    credentials: true,
  }))

  app.use(async ({ response }, next) => {
    if (!data) {
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
