const router = require('express').Router();
const ctrl = require('../controllers/bookingsController');

router.get('/', ctrl.list);
router.get('/waitlist', ctrl.getWaitlist);
router.post('/', ctrl.create);
router.post('/check-availability', ctrl.checkAvailability);
router.post('/calculate-price', ctrl.calculatePrice);
router.post('/cancel', ctrl.cancel);

module.exports = router;
