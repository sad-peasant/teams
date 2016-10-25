'use strict';

const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9\-]*$/,
    lowercase: true
  }
});

teamSchema.statics.exists = function exists (slug) {
  return this.findOne({ slug: slug }).exec()
    .then((team) => team ? true : false);
};

module.exports = mongoose.model('Team', teamSchema);
