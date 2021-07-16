const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  date_sent: {
    type: String,
  },
  scope: [
    {
      type: String
    }
  ],
  total: {
    type: String
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  notes: [
    { 
      type: String
    }
  ]
})

module.exports = mongoose.model('Invoice', schema)