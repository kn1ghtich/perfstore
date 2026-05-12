const { Router } = require('express');
const orderController = require('../controllers/order.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = Router();

router.post('/', optionalAuth, orderController.create);
router.get('/', authenticate, orderController.list);
router.get('/:id', authenticate, orderController.getOne);

module.exports = router;
