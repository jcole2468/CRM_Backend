const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  title: {
    type: String
  },
  description: {
    type: String
  },
  scope: [
    {
      type: String
    }
  ],
  total: {
    type: String
  },
  quote: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quote'
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: [
    {
      type: String
    }
  ]
})

module.exports = mongoose.model('Job', schema)