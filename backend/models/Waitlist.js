const mongoose = require('mongoose');

const WaitlistSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  court: { type: mongoose.Schema.Types.ObjectId, ref: 'Court', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  equipment: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' }],
  equipmentQty: { type: Map, of: Number },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach' },
  position: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Waitlist', WaitlistSchema);
