const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getCommunity, createPost, updateCommunityStats } = require('../controllers/communityController');

router.get('/', auth, getCommunity);
router.post('/post', auth, createPost);
router.put('/stats', auth, updateCommunityStats);

module.exports = router;

