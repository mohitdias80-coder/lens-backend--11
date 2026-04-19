const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const getAnalytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const dailyResult = await pool.query(
      `SELECT * FROM brand_analytics
       WHERE brand_id=$1 AND date >= NOW() - INTERVAL '${days} days'
       ORDER BY date DESC`,
      [req.brand.id]
    );

    const topProductsResult = await pool.query(
      `SELECT p.name,
              COUNT(c.id) as sales,
              COALESCE(SUM(c.sale_amount), 0) as revenue
       FROM brand_products p
       LEFT JOIN brand_agents a ON a.brand_id = p.brand_id
       LEFT JOIN brand_agent_connections c ON c.brand_agent_id = a.id AND c.outcome = 'sale'
       WHERE p.brand_id=$1
       GROUP BY p.name ORDER BY sales DESC LIMIT 5`,
      [req.brand.id]
    );

    const rows = dailyResult.rows;
    res.json({
      daily_stats: rows,
      top_products: topProductsResult.rows,
      summary: {
        total_days: days,
        total_connections: rows.reduce((s, d) => s + d.connections, 0),
        total_sales: rows.reduce((s, d) => s + d.sales, 0),
        total_revenue: rows.reduce((s, d) => s + parseFloat(d.revenue), 0).toFixed(2)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const logAnalytics = async (req, res) => {
  try {
    const { connections, pitches_sent, accept_rate, sales, revenue, roi } = req.body;
    const result = await pool.query(
      `INSERT INTO brand_analytics (id, brand_id, connections, pitches_sent, accept_rate, sales, revenue, roi)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (brand_id, date) DO UPDATE SET
         connections = brand_analytics.connections + EXCLUDED.connections,
         pitches_sent = brand_analytics.pitches_sent + EXCLUDED.pitches_sent,
         sales = brand_analytics.sales + EXCLUDED.sales,
         revenue = brand_analytics.revenue + EXCLUDED.revenue,
         roi = EXCLUDED.roi
       RETURNING *`,
      [uuidv4(), req.brand.id, connections, pitches_sent, accept_rate, sales, revenue, roi]
    );
    res.json({ success: true, analytics: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAnalytics, logAnalytics };

