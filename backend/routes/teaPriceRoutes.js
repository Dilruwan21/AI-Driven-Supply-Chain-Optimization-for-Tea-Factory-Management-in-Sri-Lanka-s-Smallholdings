// routes/teaPriceRoutes.js
const express = require('express');
const TeaPrice = require('../models/TeaPrice ');
const router = express.Router();

// Get current price
router.get('/current', async (req, res) => {
  try {
    const latestPrice = await TeaPrice.findOne().sort({ createdAt: -1 });
    res.json({
      price: latestPrice?.price || null,
      updatedAt: latestPrice?.createdAt || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get price history
router.get('/history', async (req, res) => {
  try {
    const history = await TeaPrice.find().sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update price
router.post('/update', async (req, res) => {
  try {
    const { price, updatedBy } = req.body;
    
    if (!price || isNaN(price)) {
      return res.status(400).json({ error: "Invalid price" });
    }
    
    const newPrice = new TeaPrice({
      price: parseFloat(price),
      updatedBy
    });
    
    await newPrice.save();
    
    res.json({
      price: newPrice.price,
      updatedAt: newPrice.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
