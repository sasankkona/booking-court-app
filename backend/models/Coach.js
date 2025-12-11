const mongoose = require('mongoose');

const CoachSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String },
  hourlyRate: { type: Number, default: 0 },
  // availability stored as array of available time slots or rules (simplified)
  availability: { type: Array, default: [] },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Coach', CoachSchema);
