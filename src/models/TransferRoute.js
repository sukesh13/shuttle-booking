const mongoose = require('mongoose');

const transferRouteSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  initial_route_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  transfer_stop_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  final_route_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  points_adjustment: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TransferRoute', transferRouteSchema);