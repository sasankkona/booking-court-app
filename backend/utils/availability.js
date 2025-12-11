const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');
const Coach = require('../models/Coach');

/**
 * Check if court is available for the given time slot
 */
async function isCourtAvailable(courtId, startTime, endTime) {
  const overlapping = await Booking.findOne({
    court: courtId,
    status: 'confirmed',
    $or: [
      { startTime: { $lt: endTime, $gte: startTime } },
      { endTime: { $gt: startTime, $lte: endTime } }
    ]
  });
  return !overlapping;
}

/**
 * Check if coach is available for the given time slot
 */
async function isCoachAvailable(coachId, startTime, endTime) {
  if (!coachId) return true; // Optional resource
  const overlapping = await Booking.findOne({
    coach: coachId,
    status: 'confirmed',
    $or: [
      { startTime: { $lt: endTime, $gte: startTime } },
      { endTime: { $gt: startTime, $lte: endTime } }
    ]
  });
  return !overlapping;
}

/**
 * Check if equipment is available in requested quantities
 */
async function isEquipmentAvailable(equipmentMap) {
  if (!equipmentMap || Object.keys(equipmentMap).length === 0) return true;

  for (const [equipmentId, qty] of Object.entries(equipmentMap)) {
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) return false;

    const booked = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $unwind: '$equipmentQty' },
      { $match: { 'equipmentQty.k': equipmentId } },
      { $group: { _id: null, total: { $sum: '$equipmentQty.v' } } }
    ]);

    const totalBooked = booked.length > 0 ? booked[0].total : 0;
    const available = equipment.totalQuantity - totalBooked;

    if (available < qty) return false;
  }
  return true;
}

/**
 * Check all resources atomically
 */
async function checkAvailability(courtId, startTime, endTime, coachId, equipmentMap) {
  const courtOk = await isCourtAvailable(courtId, startTime, endTime);
  if (!courtOk) throw new Error('Court not available for selected time');

  const coachOk = await isCoachAvailable(coachId, startTime, endTime);
  if (!coachOk) throw new Error('Coach not available for selected time');

  const equipOk = await isEquipmentAvailable(equipmentMap);
  if (!equipOk) throw new Error('Insufficient equipment available');

  return true;
}

module.exports = { checkAvailability, isCourtAvailable, isCoachAvailable, isEquipmentAvailable };
