const Booking = require('../models/Booking');
const Waitlist = require('../models/Waitlist');
const { checkAvailability } = require('./availability');
const { calculatePrice } = require('./priceCalculator');

/**
 * Atomic booking with waitlist fallback
 * If resources are not available, add to waitlist
 */
async function atomicBooking(bookingData) {
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const {
      userName,
      court,
      startTime,
      endTime,
      equipment,
      equipmentQty,
      coach
    } = bookingData;

    // Check if all resources are available
    const available = await Booking.findOne({
      court,
      status: 'confirmed',
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } }
      ]
    }).session(session);

    if (available) {
      // Create a waitlist entry instead
      const waitlistCount = await Waitlist.countDocuments({
        court,
        startTime
      }).session(session);

      const waitlistEntry = new Waitlist({
        userName,
        court,
        startTime,
        endTime,
        equipment: equipment || [],
        equipmentQty: equipmentQty || {},
        coach: coach || null,
        position: waitlistCount + 1
      });

      await waitlistEntry.save({ session });
      await session.commitTransaction();
      return { status: 'waitlist', waitlistId: waitlistEntry._id, position: waitlistEntry.position };
    }

    // Calculate price
    const pricingBreakdown = await calculatePrice(court, startTime, equipmentQty, coach);

    // Create confirmed booking
    const booking = new Booking({
      userName,
      court,
      startTime,
      endTime,
      equipment: equipment || [],
      equipmentQty: equipmentQty || {},
      coach: coach || null,
      status: 'confirmed',
      pricingBreakdown
    });

    await booking.save({ session });
    await session.commitTransaction();
    return { status: 'confirmed', bookingId: booking._id };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

/**
 * On cancellation, promote first waitlist entry if resources become available
 */
async function cancelBookingAndPromoteWaitlist(bookingId) {
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) throw new Error('Booking not found');

    // Cancel the booking
    booking.status = 'cancelled';
    await booking.save({ session });

    // Find waitlist entries for this time slot
    const waitlist = await Waitlist.findOne({
      court: booking.court,
      startTime: booking.startTime,
      position: 1
    }).session(session);

    if (!waitlist) {
      await session.commitTransaction();
      session.endSession();
      return { promoted: false };
    }

    // Try to convert waitlist to confirmed booking
    const pricingBreakdown = await calculatePrice(
      booking.court,
      booking.startTime,
      waitlist.equipmentQty,
      waitlist.coach
    );

    const newBooking = new Booking({
      userName: waitlist.userName,
      court: waitlist.court,
      startTime: waitlist.startTime,
      endTime: waitlist.endTime,
      equipment: waitlist.equipment,
      equipmentQty: waitlist.equipmentQty,
      coach: waitlist.coach,
      status: 'confirmed',
      pricingBreakdown
    });

    await newBooking.save({ session });
    await Waitlist.deleteOne({ _id: waitlist._id }).session(session);

    // Re-position remaining waitlist entries
    await Waitlist.updateMany(
      { court: booking.court, startTime: booking.startTime, position: { $gt: 1 } },
      { $inc: { position: -1 } }
    ).session(session);

    await session.commitTransaction();
    return { promoted: true, newBookingId: newBooking._id, promotedUser: waitlist.userName };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

module.exports = { atomicBooking, cancelBookingAndPromoteWaitlist };
