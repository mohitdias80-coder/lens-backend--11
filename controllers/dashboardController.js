const { pool } = require('../config/db');

const getDashboard = async (req, res) => {
  try {
    const brandResult = await pool.query(
      'SELECT id, name, email, subscription_tier FROM brands WHERE id = $1',
      [req.brand.id]
    );
    const brand = brandResult.rows[0];

    const agentResult = await pool.query(
      'SELECT * FROM brand_agents WHERE brand_id = $1',
      [req.brand.id]
    );
    const agent = agentResult.rows[0];

    const statsResult = await pool.query(
      `SELECT
        COALESCE(SUM(connections), 0) as total_connections,
        COALESCE(SUM(pitches_sent), 0) as total_pitches,
        COALESCE(SUM(sales), 0) as total_sales,
        COALESCE(SUM(revenue), 0) as total_revenue,
        COALESCE(AVG(accept_rate), 0) as avg_accept_rate,
        COALESCE(AVG(roi), 0) as avg_roi
       FROM brand_analytics
       WHERE brand_id=$1 AND date >= NOW() - INTERVAL '30 days'`,
      [req.brand.id]
    );
    const s = statsResult.rows[0];

    const prevResult = await pool.query(
      `SELECT COALESCE(SUM(connections), 0) as prev_conn,
              COALESCE(SUM(sales), 0) as prev_sales
       FROM brand_analytics
       WHERE brand_id=$1
       AND date BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days'`,
      [req.brand.id]
    );
    const prev = prevResult.rows[0];

    const pct = (curr, prev) => prev == 0 ? 0 : Math.round(((curr - prev) / prev) * 100);

    const communityResult = await pool.query(
      'SELECT * FROM brand_communities WHERE brand_id = $1',
      [req.brand.id]
    );
    const community = communityResult.rows[0];

    let recentPosts = [];
    if (community) {
      const postsResult = await pool.query(
        'SELECT * FROM community_posts WHERE community_id=$1 ORDER BY created_at DESC LIMIT 5',
        [community.id]
      );
      recentPosts = postsResult.rows;
    }

    res.json({
      brand: { name: brand.name, tier: brand.subscription_tier },
      metrics: {
        connections: parseInt(s.total_connections),
        connections_change: pct(s.total_connections, prev.prev_conn),
        pitches: parseInt(s.total_pitches),
        sales: parseInt(s.total_sales),
        sales_change: pct(s.total_sales, prev.prev_sales),
        roi: parseFloat(s.avg_roi).toFixed(1),
        revenue: parseFloat(s.total_revenue).toFixed(2)
      },
      agent_performance: {
        connections: parseInt(s.total_connections),
        accept_rate: parseFloat(s.avg_accept_rate).toFixed(1),
        conversion: s.total_pitches > 0
          ? ((s.total_sales / s.total_pitches) * 100).toFixed(1) : '0.0',
        revenue: parseFloat(s.total_revenue).toFixed(2)
      },
      agent_status: agent ? {
        status: agent.status,
        uptime: '24/7',
        budget_used: (agent.monthly_budget * 0.84).toFixed(2),
        budget_total: agent.monthly_budget,
        personality: agent.personality
      } : null,
      community: community ? {
        id: community.id,
        name: community.community_name,
        members: community.member_count,
        posts: community.post_count,
        engagement: community.engagement_rate,
        recent_posts: recentPosts
      } : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getDashboard };

