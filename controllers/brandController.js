const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const updateBrand = async (req, res) => {
  try {
    const { name, website, industry, phone } = req.body;
    const result = await pool.query(
      `UPDATE brands SET name=$1, website=$2, industry=$3, phone=$4, updated_at=NOW()
       WHERE id=$5 RETURNING id, name, email, website, industry, phone`,
      [name, website, industry, phone, req.brand.id]
    );
    res.json({ success: true, brand: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addProduct = async (req, res) => {
  try {
    const { name, category, price, description, product_url, image_url } = req.body;
    const result = await pool.query(
      `INSERT INTO brand_products (id, brand_id, name, category, price, description, product_url, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [uuidv4(), req.brand.id, name, category, price, description, product_url, image_url]
    );
    res.status(201).json({ success: true, product: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM brand_products WHERE brand_id = $1 ORDER BY created_at DESC',
      [req.brand.id]
    );
    res.json({ products: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM brand_products WHERE id=$1 AND brand_id=$2',
      [req.params.id, req.brand.id]
    );
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { updateBrand, addProduct, getProducts, deleteProduct };

