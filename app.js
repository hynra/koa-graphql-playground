const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const index = require('./routes/index')
const users = require('./routes/users')

const { ApolloServer, gql } = require('apollo-server-koa')

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    rollDice(numDice: Int!, numSides: Int): [Int]
  }
`


// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    rollDice: function (... args) {
      console.log(args)
      args = args[1]
      var output = [];
      for (var i = 0; i < args.numDice; i++) {
        output.push(1 + Math.floor(Math.random() * (args.numSides || 6)));
      }
      return output;
    }
  },
}

const server = new ApolloServer({ typeDefs, resolvers });

server.applyMiddleware({ app });

app.graphqlPath = server.graphqlPath

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
