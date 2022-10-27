const mongoose = require('mongoose')

let SiteSchema = new mongoose.Schema({
    chatid: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    paused: {
        type: Boolean,
        required: true
    },
    created: {
        type: Number,
        required: true
    }
  })
  
  const Site = mongoose.model('Site', SiteSchema)
  
  module.exports = {Site}