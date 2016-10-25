'use strict';

const config = require('config');

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const express = require('express');
const app = express();

const morgan = require('morgan');
const bodyParser = require('body-parser');

app.use(morgan('combined'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const ErrorTranslator = require('./app/errors/translator');
const errorTranslator = new ErrorTranslator();

app.use('/teams', require('./app/router'));

app.use(function (err, req, res, next) {
  res.status(errorTranslator.translate(err)).send(err.name);

  if (res.statusCode === 500) {
    console.error(err);
  }

  next();
});

app.listen(3000, function () {
  if (config.db.inMemory) {
    require('mockgoose')(mongoose).then(() => {
      mongoose.connect(config.db.url);
    });
  } else {
    mongoose.connect(config.db.url);
  }
  console.log('Listening on port 3000!');
});

module.exports = app;