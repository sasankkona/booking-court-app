require('dotenv').config();
const mongoose = require('mongoose');
const Court = require('./models/Court');
const Equipment = require('./models/Equipment');
const Coach = require('./models/Coach');
const PricingRule = require('./models/PricingRule');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB for seeding');

  await Court.deleteMany({});
  await Equipment.deleteMany({});
  await Coach.deleteMany({});
  await PricingRule.deleteMany({});

  const courts = [
    { name: 'Court 1', type: 'indoor', basePrice: 15 },
    { name: 'Court 2', type: 'indoor', basePrice: 15 },
    { name: 'Court 3', type: 'outdoor', basePrice: 10 },
    { name: 'Court 4', type: 'outdoor', basePrice: 10 }
  ];
  await Court.insertMany(courts);

  const equipment = [
    { name: 'Racket', totalQuantity: 8, rentalPrice: 5 },
    { name: 'Shoes', totalQuantity: 6, rentalPrice: 3 }
  ];
  await Equipment.insertMany(equipment);

  const coaches = [
    { name: 'Coach A', hourlyRate: 20, availability: [] },
    { name: 'Coach B', hourlyRate: 25, availability: [] },
    { name: 'Coach C', hourlyRate: 18, availability: [] }
  ];
  await Coach.insertMany(coaches);

  const rules = [
    // Peak hours 18-21 multiplier
    { name: 'Peak Hours', type: 'timeRange', params: { startHour: 18, endHour: 21 }, multiplier: 1.5, active: true },
    // Weekend surcharge
    { name: 'Weekend Surcharge', type: 'day', params: { days: [0,6] }, surcharge: 5, active: true },
    // Indoor court premium
    { name: 'Indoor Premium', type: 'courtType', params: { courtType: 'indoor' }, surcharge: 3, active: true }
  ];
  await PricingRule.insertMany(rules);

  console.log('Seeding completed');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
