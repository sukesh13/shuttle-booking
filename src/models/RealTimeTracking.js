const mongoose = require('mongoose');

const realTimeTrackingSchema = new mongoose.Schema({
  shuttle_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shuttle',
    required: true
  },
  route_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  current_location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  occupancy: {
    type: Number,
    required: true,
    min: 0
  },
  last_updated: {
    type: Date,
    default: Date.now
  }
});

// Index for real-time queries
realTimeTrackingSchema.index({ shuttle_id: 1, last_updated: -1 });

module.exports = mongoose.model('RealTimeTracking', realTimeTrackingSchema);