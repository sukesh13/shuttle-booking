const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  start_stop_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  end_stop_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  points_deducted: {
    type: Number,
    required: true,
    min: 0
  },
  booking_time: {
    type: Date,
    default: Date.now
  },
  trip_start_time: Date,
  trip_end_time: Date
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

module.exports = mongoose.model('Booking', bookingSchema);