const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flightId: {
    type: String
  },
  departureLocation: {
    type: String
  },
  arrivalLocation: {
    type: String
  },
  departure: {
    type: Date
  },
  arrival: {
    type: Date
  },
  duration: {
    type: Number
  },
  category: {
    type: String
  }
});

const Flight = mongoose.model('Flight', flightSchema);

module.exports = Flight;
