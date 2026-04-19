const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const getCommunity = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM brand_communities WHERE brand_id=$1',
      [req.brand.id]
    );
    if (result.rows.length === 0) return res.json({ community: null });

    const community = result.rows[0];
    const posts = await pool.query(
      'SELECT * FROM community_posts WHERE community_id=$1 ORDER BY created_at DESC LIMIT 20',
      [community.id]
    );
    res.json({ community: { ...community, posts: posts.rows } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createPost = async (req, res) => {
  try {
    const { content, target_interests } = req.body;
    const comm = await pool.query('SELECT id FROM brand_communities WHERE brand_id=$1', [req.brand.id]);
    if (comm.rows.length === 0)
      return res.status(404).json({ error: 'No community. Generate your agent first.' });

    const communityId = comm.rows[0].id;
    const result = await pool.query(
      `INSERT INTO community_posts (id, community_id, content, target_interests)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [uuidv4(), communityId, content, target_interests]
    );
    await pool.query(
      'UPDATE brand_communities SET post_count = post_count + 1 WHERE id=$1',
      [communityId]
    );
    res.status(201).json({ success: true, post: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateCommunityStats = async (req, res) => {
  try {
    const { member_count, engagement_rate } = req.body;
    const result = await pool.query(
      `UPDATE brand_communities SET member_count=$1, engagement_rate=$2
       WHERE brand_id=$3 RETURNING *`,
      [member_count, engagement_rate, req.brand.id]
    );
    res.json({ success: true, community: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getCommunity, createPost, updateCommunityStats };

