const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userName: { type: String },
  court: { type: mongoose.Schema.Types.ObjectId, ref: 'Court', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  equipment: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' }],
  equipmentQty: { type: Map, of: Number },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach' },
  status: { type: String, enum: ['confirmed','cancelled','waitlist'], default: 'confirmed' },
  pricingBreakdown: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
