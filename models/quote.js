const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  description: {
    type: String
  },
  scope: [
    { 
      type: String
    }
  ],
  total: {
    type: String,
  },
  notes: {
    type: String
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  }
})

module.exports = mongoose.model('Quote', schema)