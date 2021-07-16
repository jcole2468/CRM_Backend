require('dotenv').config()

const { ApolloServer, UserInputError, AuthenticationError, gql } = require('apollo-server')

const mongoose = require('mongoose')
const Client = require('./models/client')
const Address = require('./models/address')
const Quote = require('./models/quote')
const Job = require('./models/job')
const Invoice = require('./models/invoice')
const User = require('./models/user')

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
    quotes: [Quote]
    address: Address
    jobs: [Job]
    invoices: [Invoice]
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

  type Job {
    description: String
    scope: [String]
    total: String
    user: User
    notes: String
    quote: Quote
    client: Client
  }

  type Invoice {
    date_sent: String
    scope: [String]
    total: String
    job: Job
    notes: [String]
    client: Client
  }

  type User {
      name: String
      email: String
  }

  type Query {
    allClients: [Client!]
    allQuotes: [Quote!]
    allJobs: [Job!]
    allInvoices: [Invoice!]
  }
`

const resolvers = {
  Query: {
    allClients: () => Client.find({}),
    allQuotes: () => Quote.find({}),
    allJobs: () => Job.find({}),
    allInvoices: () => Invoice.find({})
  },
  Client: {
    address: async (root) => {
      const address = await Address.findById(root.address)

      return {
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.zip
      }
    },
    quotes: async (root) => {
      const quotes = await Quote.find({ client: root._id })
      return quotes
    },
    jobs: async (root) => {
      const jobs = await Job.find({ client: root._id })
      return jobs
    },
    invoices: async (root) => {
      const invoices = await Invoice.find({ client: root._id })
      return invoices
    }
  },
  Quote: {
    client: (root) => Client.findById(root.client)
  },
  Job: {
    quote: (root) => Quote.findById(root.quote),
    client: (root) => Client.findById(root.client)
  },
  Invoice: {
    
    job: (root) => Job.findById(root.job),
    client: (root) => Client.findById(root.client)
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
