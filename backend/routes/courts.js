const router = require('express').Router();
const ctrl = require('../controllers/courtsController');

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.delete('/:id', ctrl.delete);
router.put('/:id', ctrl.update);

module.exports = router;
