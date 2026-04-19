const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAnalytics, logAnalytics } = require('../controllers/analyticsController');

router.get('/', auth, getAnalytics);
router.post('/log', auth, logAnalytics);

module.exports = router;

