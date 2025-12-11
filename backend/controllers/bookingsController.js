const Booking = require('../models/Booking');
const Waitlist = require('../models/Waitlist');
const { checkAvailability } = require('../utils/availability');
const { calculatePrice } = require('../utils/priceCalculator');
const { atomicBooking, cancelBookingAndPromoteWaitlist } = require('../utils/bookingService');

exports.list = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('court equipment coach');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { userName, court, startTime, endTime, equipment, coach, equipmentQty } = req.body;

    const result = await atomicBooking({
      userName,
      court,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      equipment,
      equipmentQty,
      coach
    });

    res.status(result.status === 'confirmed' ? 201 : 202).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const { court, startTime, endTime, coach, equipmentQty } = req.body;
    await checkAvailability(court, new Date(startTime), new Date(endTime), coach, equipmentQty);
    res.json({ available: true });
  } catch (err) {
    res.status(400).json({ available: false, error: err.message });
  }
};

exports.calculatePrice = async (req, res) => {
  try {
    const { court, startTime, equipmentQty, coach } = req.body;
    const breakdown = await calculatePrice(court, new Date(startTime), equipmentQty, coach);
    res.json(breakdown);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const result = await cancelBookingAndPromoteWaitlist(bookingId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getWaitlist = async (req, res) => {
  try {
    const waitlist = await Waitlist.find().populate('court equipment coach').sort('position');
    res.json(waitlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
