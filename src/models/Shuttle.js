const mongoose = require('mongoose');

const shuttleSchema = new mongoose.Schema({
  route_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  current_occupancy: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
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
  passengers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// Validate current_occupancy doesn't exceed capacity
shuttleSchema.pre('save', function(next) {
  if (this.current_occupancy > this.capacity) {
    next(new Error('Current occupancy cannot exceed shuttle capacity'));
  }
  next();
});

module.exports = mongoose.model('Shuttle', shuttleSchema);