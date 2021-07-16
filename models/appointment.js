const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  title: {
    type: String
  },
  details: {
    type: String
  },
  request_date: {
    type: String
  },
  app_time: {
    type: String
  },
  requested_on: {
    type: String
  },
  notes: [
    {
      type: String
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  }
})

module.exports = mongoose.model('Appointment', schema)