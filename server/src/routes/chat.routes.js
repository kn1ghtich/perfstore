const { Router } = require('express');
const chatController = require('../controllers/chat.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = Router();

router.post('/sessions', optionalAuth, chatController.createSession);
router.get('/sessions', authenticate, chatController.listSessions);
router.get('/sessions/:sessionId', optionalAuth, chatController.getSession);
router.post('/sessions/:sessionId/messages', optionalAuth, chatController.sendMessage);

module.exports = router;
