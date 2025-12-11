const mongoose = require('mongoose');

const PricingRuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['timeRange','day','courtType','fixed'], required: true },
  params: { type: Object, default: {} },
  multiplier: { type: Number, default: 1 },
  surcharge: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('PricingRule', PricingRuleSchema);
