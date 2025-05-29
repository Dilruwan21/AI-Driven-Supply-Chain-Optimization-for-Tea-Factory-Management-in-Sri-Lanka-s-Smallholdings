const express = require('express');
const router = express.Router();
const FinishedTea = require('../models/FinishedTea');
const Wastage = require('../models/Wastage');

// Get all stock
router.get('/stock', async (req, res) => {
  try {
    const stock = await FinishedTea.find().sort({ date: -1 });
    res.json(stock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all wastage
router.get('/wastage', async (req, res) => {
  try {
    const wastage = await Wastage.find().sort({ date: -1 });
    res.json(wastage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new stock
// In your finished-tea routes
router.post('/add-stock', async (req, res) => {
  try {
    const { stockId, kgPerStock, quantity, rawTeaUsed, date } = req.body;
    
    if (!stockId || kgPerStock === undefined || quantity === undefined || rawTeaUsed === undefined) {
      return res.status(400).json({
        error: "Missing required fields (stockId, kgPerStock, quantity, rawTeaUsed)"
      });
    }

    const kgProduced = kgPerStock * quantity;
    const wastage = rawTeaUsed - kgProduced;

    const stock = new FinishedTea({
      stockId,
      kgPerStock,
      quantity,
      kgProduced,
      rawTeaUsed,
      wastage,
      date: date ? new Date(date) : new Date()
    });

    const savedStock = await stock.save();
    
    if (wastage > 0) {
      await new Wastage({
        kgs: wastage,
        reason: 'processing_wastage',
        batchId: savedStock._id,
        date: new Date()
      }).save();
    }

    res.status(201).json({
      success: true,
      stock: savedStock
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        error: "Stock ID already exists",
        field: "stockId"
      });
    }
    res.status(500).json({
      error: "Failed to create stock record",
      details: err.message
    });
  }
});
// Add to your existing routes
router.get('/monthly-stock', async (req, res) => {
  try {
    const stockData = await FinishedTea.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          kgProduced: { $sum: "$kgProduced" },
          rawTeaUsed: { $sum: "$rawTeaUsed" },
          wastage: { $sum: "$wastage" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    res.json(stockData);
  } catch (err) {
    console.error("Monthly stock error:", err);
    res.status(500).json({ 
      error: "Error fetching monthly stock data",
      details: err.message
    });
  }
});
module.exports = router;
