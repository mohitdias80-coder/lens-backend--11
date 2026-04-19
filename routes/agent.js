const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { generateAgent, getAgent, updateAgent, pauseAgent } = require('../controllers/agentController');

router.post('/generate', auth, generateAgent);
router.get('/', auth, getAgent);
router.put('/settings', auth, updateAgent);
router.post('/pause', auth, pauseAgent);

module.exports = router;

