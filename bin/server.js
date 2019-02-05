const Koa = require('koa');
const { ApolloServer, gql } = require('apollo-server-koa');
 
// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  input MessageInput {
    content: String
    author: String
  }

  type Message {
    id: ID!
    content: String
    author: String
  }

  type Query {
    getMessage(id: ID!): Message
  }

  type Mutation {
    createMessage(input: MessageInput): Message
    updateMessage(id: ID!, input: MessageInput): Message
  }
`


// If Message had any complex fields, we'd put them on this object.
class Message {
    constructor(id, { content, author }) {
      this.id = id;
      this.content = content;
      this.author = author;
    }
  }

// Maps username to content
var fakeDatabase = {};
 
// Provide resolver functions for your schema fields
const resolvers = {
    Query: {
      getMessage: function ({ id }) {
        if (!fakeDatabase[id]) {
          throw new Error('no message exists with id ' + id);
        }
        return new Message(id, fakeDatabase[id]);
      },
    },
    Mutation: {
      createMessage: function ({input }) {
        // Create a random id for our "database".
        var id = require('crypto').randomBytes(10).toString('hex');
  
        fakeDatabase[id] = input;
        return new Message(id, input);
      },
      updateMessage: function ({ id, input }) {
        if (!fakeDatabase[id]) {
          throw new Error('no message exists with id ' + id);
        }
        // This replaces all old data, but some apps might want partial update.
        fakeDatabase[id] = input;
        return new Message(id, input);
      },
    }
  }
 
const server = new ApolloServer({ typeDefs, resolvers });
 
const app = new Koa();
server.applyMiddleware({ app });
 
app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`),
);