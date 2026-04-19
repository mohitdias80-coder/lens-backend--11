const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');

const register = async (req, res) => {
  try {
    const { name, email, password, website, industry, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password required' });

    const existing = await pool.query('SELECT id FROM brands WHERE email = $1', [email]);
    if (existing.rows.length > 0)
      return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO brands (id, name, email, password, website, industry, phone)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, name, email, industry, subscription_tier, status, created_at`,
      [uuidv4(), name, email, hashed, website, industry, phone]
    );

    const brand = result.rows[0];
    const token = jwt.sign({ id: brand.id, email: brand.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ success: true, token, brand });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const result = await pool.query('SELECT * FROM brands WHERE email = $1', [email]);
    if (result.rows.length === 0)
      return res.status(401).json({ error: 'Invalid credentials' });

    const brand = result.rows[0];
    const isMatch = await bcrypt.compare(password, brand.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: brand.id, email: brand.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...brandData } = brand;
    res.json({ success: true, token, brand: brandData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, website, industry, phone, subscription_tier, status, created_at FROM brands WHERE id = $1',
      [req.brand.id]
    );
    res.json({ brand: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login, getProfile };

