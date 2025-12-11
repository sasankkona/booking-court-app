const Court = require('../models/Court');
const Equipment = require('../models/Equipment');
const Coach = require('../models/Coach');
const PricingRule = require('../models/PricingRule');

/**
 * Calculate total price based on booking details and active pricing rules
 */
async function calculatePrice(courtId, startTime, equipmentMap, coachId) {
  const court = await Court.findById(courtId);
  if (!court) throw new Error('Court not found');

  let basePrice = court.basePrice;
  let breakdown = { base: basePrice };

  // Get active pricing rules
  const rules = await PricingRule.find({ active: true });

  // Apply time-based rules (peak hours)
  const hour = new Date(startTime).getHours();
  const day = new Date(startTime).getDay();

  for (const rule of rules) {
    if (rule.type === 'timeRange' && rule.params.startHour && rule.params.endHour) {
      if (hour >= rule.params.startHour && hour < rule.params.endHour) {
        // compute surcharge based on the price before applying this multiplier
        const before = basePrice;
        basePrice = basePrice * (rule.multiplier || 1);
        const surchargeAmount = rule.surcharge != null ? rule.surcharge : (basePrice - before);
        breakdown.peakHour = (breakdown.peakHour || 0) + surchargeAmount;
      }
    }

    // Apply weekend surcharge
    if (rule.type === 'day' && rule.params.days && rule.params.days.includes(day)) {
      basePrice += rule.surcharge;
      breakdown.weekend = rule.surcharge;
    }

    // Apply court type premium
    if (rule.type === 'courtType' && rule.params.courtType === court.type) {
      basePrice += rule.surcharge;
      breakdown.courtType = rule.surcharge;
    }
  }

  // Add equipment fees
  let equipmentFee = 0;
  if (equipmentMap && Object.keys(equipmentMap).length > 0) {
    for (const [equipId, qty] of Object.entries(equipmentMap)) {
      const equip = await Equipment.findById(equipId);
      if (equip) {
        equipmentFee += equip.rentalPrice * qty;
      }
    }
    breakdown.equipment = equipmentFee;
  }

  // Add coach fee
  let coachFee = 0;
  if (coachId) {
    const coach = await Coach.findById(coachId);
    if (coach) coachFee = coach.hourlyRate;
    breakdown.coach = coachFee;
  }

  const total = basePrice + equipmentFee + coachFee;
  breakdown.total = total;

  return breakdown;
}

module.exports = { calculatePrice };
