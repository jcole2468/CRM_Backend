const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 4
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 7
  },
  password: {
    type: String,
    required: true,
  }
})

schema.pre('save', function() {
  const hashedPassword = bcrypt.hashSync(this.password, 12)
  this.password = hashedPassword
})

module.exports = mongoose.model('User', schema)