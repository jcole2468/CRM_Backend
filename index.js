require('dotenv').config()

const { ApolloServer, UserInputError, AuthenticationError, gql } = require('apollo-server')

const mongoose = require('mongoose')
const Client = require('./models/client')
const Address = require('./models/address')
const Quote = require('./models/quote')
// const Job = require('./models/job')
// const Invoice = require('./models/invoice')
// const User = require('./models/user')

const MongoUrl = process.env.MONGODB_URI

console.log('connection to', MongoUrl)

mongoose.connect(MongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Client {
    name: String!
    phone: String
    email: String
    tags: [String]
    address: Address
    quote: [Quote]
  }

  type Address {
    street: String
    city: String
    state: String
    zip: String
  }

  type Quote {
      description: String
      scope: [String]
      total: String
      notes: String 
      client: Client
    }

  type Query {
    allClients: [Client!]
  }
`

const resolvers = {
  Query: {
    allClients: () => Client.find({}),
  },
  Client: {
    address: async (root) => {
      const address = await Address.findById(root.address)
      console.log(address)

      return {
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.zip
      }
    },
    quote: async (root) => {
      const quotes = await Quote.find({ client: root._id})
      return quotes
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
