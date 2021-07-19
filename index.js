require('dotenv').config()
const { ApolloServer, UserInputError, AuthenticationError, gql } = require('apollo-server')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const mongoose = require('mongoose')
const Client = require('./models/client')
const Address = require('./models/address')
const Appointment = require('./models/appointment')
const Quote = require('./models/quote')
const Job = require('./models/job')
const Invoice = require('./models/invoice')
const User = require('./models/user')

const JWT_SECRET = process.env.SECRET

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
    notes: [String]
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
      name: String!
      email: String!
      id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    allClients: [Client!]
    allAppointments: [Appointment!]
    allQuotes: [Quote!]
    allJobs: [Job!]
    allInvoices: [Invoice!]
    me: User
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
      title: String
      details: String
      request_date: String
      requested_on: String 
      notes: [String]
      user: User
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
    addJob(
      title: String
      description: String
      scope: [String]
      total: String
      client: String
      notes: [String]
    ): Job
    updateClient(
      name: String!
      phone: String
      email: String
      tags: [String]
    ): Client
    updateAppointment(
      id: ID!
      title: String
      details: String
      request_date: String
      notes: [String]
    ): Appointment
    updateQuote(
      id: ID!
      description: String
      scope: [String]
      total: String
      notes: String
    ): Quote
    updateJob(
      id: ID!
      description: String
      scope: [String]
      total: String
      notes: [String]
    ): Job
    updateInvoice(
      id: ID!
      scope: [String]
      total: String
    ): Invoice
    createUser(
      name: String!
      email: String!
      password: String!
    ): User
    login(
      email: String!
      password: String!
    ): Token
  }
`

const resolvers = {
  Query: {
    allClients: () => Client.find({}),
    allAppointments: () => Appointment.find({}),
    allQuotes: () => Quote.find({}),
    allJobs: () => Job.find({}),
    allInvoices: () => Invoice.find({}),
    me: (root, args, context) => {
      return context.currentUser
    }
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
    addClient: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

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
    addAppointment: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

      const client = await Client.findOne({ name: args.client })

      const newAppointment = new Appointment({ 
        title: args.title,
        details: args.details,
        request_date: args.request_date,
        requested_on: args.requested_on,
        notes: args.notes,
        user: args.user,
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
    addQuote: async (root, args, context) => {
      const currentUser = context.currentUser
      console.log(context)

      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

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
    addJob: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

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
    addInvoice: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

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
    },
    updateClient: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

      const client = await Client.findOne({ name: args.name })

      if (!client) {
        throw new UserInputError( error.message, {
          invalidArgs: args,
        })
      }
      if (args.name !== undefined) {
        client.name = args.name
      }
      if (args.phone !== undefined) {
        client.phone = args.phone
      }
      if (args.email !== undefined) {
        client.email = args.email
      }
      if (args.tags !== undefined) {
        client.tags = args.tags
      }
      
      try {
        await client.save()
        return client
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    updateAppointment: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

      const appointment = await Appointment.findById(args.id)

      if (!appointment) {
        throw new UserInputError( error.message, {
          invalidArgs: args,
        })
      }
      if (args.title !== undefined) {
        appointment.title = args.title
      }
      if (args.details !== undefined) {
        appointment.details = args.details
      }
      if (args.request_date !== undefined) {
        appointment.request_date = args.request_date
      }
      if (args.notes !== undefined) {
        appointment.notes = args.notes
      }
      
      try {
        await appointment.save()
        return appointment
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    updateQuote: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

      const quote = await Quote.findById(args.id)

      if (!quote) {
        throw new UserInputError( error.message, {
          invalidArgs: args,
        })
      }
      if (args.description !== undefined) {
        quote.description = args.description
      }
      if (args.scope !== undefined) {
        quote.scope = args.scope
      }
      if (args.total !== undefined) {
        quote.total = args.total
      }
      if (args.notes !== undefined) {
        quote.notes = args.notes
      }
      
      try {
        await quote.save()
        return quote
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    updateJob: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

      const job = await Job.findById(args.id)

      if (!job) {
        throw new UserInputError( error.message, {
          invalidArgs: args,
        })
      }

      if (args.description !== undefined) {
        job.description = args.description
      }
      if (args.scope !== undefined) {
        job.scope = args.scope
      }
      if (args.total !== undefined) {
        job.total = args.total
      }
      if (args.notes !== undefined) {
        job.notes = args.notes
      }
      
      try {
        await job.save()
        return job
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    updateInvoice: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

      const invoice = await Invoice.findById(args.invoice)

      if (!invoice) {
        throw new UserInputError( error.message, {
          invalidArgs: args,
        })
      }
      if (args.scope !== undefined) {
        invoice.scope = args.scope
      }
      if (args.total !== undefined) {
        invoice.total = args.total
      }
      
      try {
        await invoice.save()
        return invoice
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    createUser: async (root, args) => {

      const user = new User({ 
        name: args.name,
        email: args.email,
        password: args.password,
      })
  
      try {
        await user.save()
        return user
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    login: async (root, args) => {
      const user = await User.findOne({ email: args.email })
      console.log(args, user.password)
      const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(args.password, user.password)

      if (!(user && passwordCorrect)) {
        throw new UserInputError("wrong credentials")
      }

      const userForToken = {
        email: user.email,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, JWT_SECRET)}
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }

})

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
