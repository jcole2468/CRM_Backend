const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  quote: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quote'
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