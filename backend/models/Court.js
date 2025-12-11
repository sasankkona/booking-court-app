const mongoose = require('mongoose');

const CourtSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['indoor', 'outdoor'], required: true },
  active: { type: Boolean, default: true },
  basePrice: { type: Number, default: 10 }
}, { timestamps: true });

module.exports = mongoose.model('Court', CourtSchema);
