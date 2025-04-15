const mongoose = require('mongoose');

const neighborSchema = new mongoose.Schema({
  stop_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stop',
    required: true
  },
  route_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  distance: {
    type: Number,
    required: true
  }
});

const stopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  neighbors: [neighborSchema],
  routes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  }]
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

module.exports = mongoose.model('Stop', stopSchema); 