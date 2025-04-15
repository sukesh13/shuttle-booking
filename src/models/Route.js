const mongoose = require('mongoose');

const stopInfoSchema = new mongoose.Schema({
  stop_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stop',
    required: true
  },
  distance_traveled: {
    type: Number,
    required: true
  }
});

const routeSchema = new mongoose.Schema({
  route_name: {
    type: String,
    required: true,
    unique: true
  },
  stops: [stopInfoSchema],
  peak_hours: {
    start_time: {
      type: Date,
      required: true
    },
    end_time: {
      type: Date,
      required: true
    }
  },
  demand_level: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

module.exports = mongoose.model('Route', routeSchema);