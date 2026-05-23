const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

hasBoiler: {
  type: Boolean,
  default: false
},

peopleCount: {
  type: Number,
  default: 1
},

hasDualZoneMeter: {
  type: Boolean,
  default: false
},

  password: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("User", userSchema);