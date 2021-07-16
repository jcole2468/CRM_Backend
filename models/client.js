const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minLength: 5
  },
  phone: {
    type: String,
    minLength: 5
  },
  email: {
    type: String,
    minLength: 8
  },
  tags: [
    { type: String }
  ],
  quotes: [
    { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quote'
    }
  ],
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  },
  // jobs: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'Job'
  //   }
  // ],
  // invoices: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'Invoice'
  //   }
  // ]
})

schema.plugin(uniqueValidator)
module.exports = mongoose.model('Client', schema)