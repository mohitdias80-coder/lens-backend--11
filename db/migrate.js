const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

const migrate = async () => {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('Database migrated ✅');
  } catch (err) {
    console.error('Migration error:', err.message);
  }
};

module.exports = migrate;

