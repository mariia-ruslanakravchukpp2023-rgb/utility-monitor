const mongoose = require("mongoose");

const readingSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true
  },

  type: {
    type: String,
    required: true
  },

  value: {
    type: Number,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  totalCost: {
    type: Number,
    required: true
  },

  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Reading", readingSchema);