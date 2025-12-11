const PricingRule = require('../models/PricingRule');

exports.list = async (req, res) => {
  try {
    const rules = await PricingRule.find();
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const rule = new PricingRule(req.body);
    await rule.save();
    res.status(201).json(rule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const updated = await PricingRule.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Pricing rule not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const removed = await PricingRule.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ error: 'Pricing rule not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
