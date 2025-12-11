const Court = require('../models/Court');

exports.list = async (req, res) => {
  try {
    const courts = await Court.find();
    res.json(courts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const court = new Court(req.body);
    await court.save();
    res.status(201).json(court);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const removed = await Court.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ error: 'Court not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const updated = await Court.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Court not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
