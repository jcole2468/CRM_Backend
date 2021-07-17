require('dotenv').config()

const { ApolloServer, UserInputError, AuthenticationError, gql } = require('apollo-server')

const mongoose = require('mongoose')
const Client = require('./models/client')
const Address = require('./models/address')
const Appointment = require('./models/appointment')
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
    appointments: [Appointment]
    quotes: [Quote]
    address: Address
    jobs: [Job]
    invoices: [Invoice]
    id: ID!
  }

  type Address {
    street: String
    city: String
    state: String
    zip: String
    id: ID!
  }

  type Appointment {
    title: String
    details: String
    request_date: String
    requested_on: String
    notes: [String]
    user: User
    client: Client
    id: ID!
  }

  type Quote {
      description: String
      scope: [String]
      total: String
      notes: String 
      client: Client
      id: ID!
    }

  type Job {
    description: String
    scope: [String]
    total: String
    user: User
    notes: String
    quote: Quote
    client: Client
    id: ID!
  }

  type Invoice {
    date_sent: String
    scope: [String]
    total: String
    job: Job
    notes: [String]
    client: Client
    id: ID!
  }

  type User {
      name: String
      email: String
      id: ID!
  }

  type Query {
    allClients: [Client!]
    allAppointments: [Appointment!]
    allQuotes: [Quote!]
    allJobs: [Job!]
    allInvoices: [Invoice!]
  }

  type Mutation {
    addClient(
      name: String
      phone: String
      email: String
      tags: [String]
      street: String
      city: String
      state: String
      zip: String
    ): Client
    addAppointment(
      description: String
      scope: String
      total: String
      requested_on: String 
      notes: [String]
      client: String
    ): Appointment
    addQuote(
      description: String
      scope: [String]
      total: String
      notes: String
      client: String
    ): Quote
    addInvoice(
      title: String
      description: String
      scope: [String] 
      total: String 
      quote: String
      client: String
      user: String
      notes: [String]
    ): Invoice
  }
`

const resolvers = {
  Query: {
    allClients: () => Client.find({}),
    allAppointments: () => Appointment.find({}),
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
    appointments: async (root) => {
      const appointments = await Appointment.find({ client: root._id})
      return appointments
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
  Appointment: {
    client: (root) => Client.findById(root.client),
    user: (root) => User.findById(root.user)
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
  },
  Mutation: {
    addClient: async (root, args) => {
      const address = new Address({
        street: args.street,
        city: args.city,
        state: args.state,
        zip: args.zip
      })
      const client = new Client({ 
        name: args.name,
        phone: args.phone,
        email: args.email,
        tags: args.tags,
        address: address
       })
      
      try {
        await client.save()
        await address.save()
        return client
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    addAppointment: async (root, args) => {
      const client = await Client.findOne({ name: args.client })
      console.log(client)
      const newAppointment = new Appointment({ 
        description: args.description,
        scope: args.scope,
        total: args.total,
        notes: args.notes,
        requested_on: args.requested_on,
        client: client._id 
      })
      console.log(newAppointment)
      try {
        await newAppointment.save()
        return newAppointment
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    addQuote: async (root, args) => {
      const client = await Client.findOne({ name: args.client })
      const newInvoice = new Quote({ 
        description: args.description,
        scope: args.scope,
        total: args.total,
        notes: args.notes,
        client: client._id 
      })
      console.log(newInvoice)
      try {
        await newInvoice.save()
        return newInvoice
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    addJob: async (root, args) => {
      const client = await Client.findOne({ name: args.client })
      const newJob = new Job({ 
        title: args.title,
        description: args.description,
        scope: args.scope,
        total: args.total,
        notes: args.notes,
        user: args.user,
        client: client._id
      })
      console.log(newJob)
      try {
        await newJob.save()
        return newJob
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    addInvoice: async (root, args) => {
      const client = await Client.findOne({ name: args.client })
      const newInvoice = new Invoice({ 
        date_sent: args.date_sent,
        scope: args.scope,
        total: args.total,
        notes: args.notes,
        client: client._id 
      })
      console.log(newInvoice)
      try {
        await newInvoice.save()
        return newInvoice
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
