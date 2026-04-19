const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const generateAgent = async (req, res) => {
  try {
    const { personality, monthly_budget, cost_per_connection, max_daily_connections, target_interests } = req.body;

    const brandResult = await pool.query('SELECT * FROM brands WHERE id = $1', [req.brand.id]);
    const brand = brandResult.rows[0];

    const productsResult = await pool.query(
      'SELECT name FROM brand_products WHERE brand_id = $1 LIMIT 3',
      [req.brand.id]
    );
    const productNames = productsResult.rows.map(p => p.name).join(', ') || 'our products';

    const agentId = `${brand.name.toLowerCase().replace(/\s+/g, '_')}_agent_${uuidv4().slice(0, 8)}`;
    const soul = `I represent ${brand.name}. My mission is to help people discover ${productNames}. I am ${personality || 'balanced'}, helpful, and always looking for customers who share my interests.`;

    const existing = await pool.query('SELECT id FROM brand_agents WHERE brand_id = $1', [req.brand.id]);

    let agent;
    if (existing.rows.length > 0) {
      const result = await pool.query(
        `UPDATE brand_agents SET agent_id=$1, personality=$2, monthly_budget=$3,
         cost_per_connection=$4, max_daily_connections=$5, target_interests=$6,
         soul=$7, status='active', deployed_at=NOW()
         WHERE brand_id=$8 RETURNING *`,
        [agentId, personality, monthly_budget, cost_per_connection, max_daily_connections, target_interests, soul, req.brand.id]
      );
      agent = result.rows[0];
    } else {
      const result = await pool.query(
        `INSERT INTO brand_agents (id, brand_id, agent_name, agent_id, personality, monthly_budget,
         cost_per_connection, max_daily_connections, target_interests, soul)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [uuidv4(), req.brand.id, `${brand.name} AI Agent`, agentId, personality,
         monthly_budget, cost_per_connection, max_daily_connections, target_interests, soul]
      );
      agent = result.rows[0];

      await pool.query(
        `INSERT INTO brand_communities (id, brand_id, brand_agent_id, community_name)
         VALUES ($1,$2,$3,$4)`,
        [uuidv4(), req.brand.id, agent.id, `${brand.name} Community`]
      );
    }

    res.status(201).json({ success: true, message: 'Agent deployed', agent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAgent = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM brand_agents WHERE brand_id = $1', [req.brand.id]);
    res.json({ agent: result.rows[0] || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateAgent = async (req, res) => {
  try {
    const { personality, monthly_budget, cost_per_connection, max_daily_connections, target_interests } = req.body;
    const result = await pool.query(
      `UPDATE brand_agents SET personality=$1, monthly_budget=$2, cost_per_connection=$3,
       max_daily_connections=$4, target_interests=$5, last_active=NOW()
       WHERE brand_id=$6 RETURNING *`,
      [personality, monthly_budget, cost_per_connection, max_daily_connections, target_interests, req.brand.id]
    );
    res.json({ success: true, message: 'Agent updated', agent: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const pauseAgent = async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE brand_agents SET status = CASE WHEN status='active' THEN 'paused' ELSE 'active' END
       WHERE brand_id=$1 RETURNING status`,
      [req.brand.id]
    );
    res.json({ success: true, status: result.rows[0].status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { generateAgent, getAgent, updateAgent, pauseAgent };

