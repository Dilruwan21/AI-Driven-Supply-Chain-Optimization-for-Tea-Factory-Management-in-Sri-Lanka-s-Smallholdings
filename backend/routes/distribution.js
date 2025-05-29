
const express = require('express');
const router = express.Router();
const Distribution = require('../models/Distribution');
const FinishedTeaStock = require('../models/FinishedTea');
const PriceSetting = require('../models/PriceSetting');

// Create distribution record
router.post('/', async (req, res) => {
  try {
    const { stockId, distributionType, kgs, distributionDate, distributionTime, centerName, pricePerKg } = req.body;
    
    // Validate stock exists
    const stock = await FinishedTeaStock.findById(stockId);
    if (!stock) return res.status(400).json({ error: 'Invalid stock ID' });

    // Validate kgs
    const kgDistributed = parseFloat(kgs);
    if (isNaN(kgDistributed) || kgDistributed <= 0) {
      return res.status(400).json({ error: 'Please enter a valid quantity (kg)' });
    }

    // Check available quantity
    const totalDistributed = await Distribution.aggregate([
      { $match: { stockId: stockId } },
      { $group: { _id: null, total: { $sum: "$kgDistributed" } } }
    ]);
    
    const available = stock.kgProduced - (totalDistributed[0]?.total || 0);
    if (kgDistributed > available) {
      return res.status(400).json({ error: `Only ${available} kg available` });
    }

    // Create timestamp from date and time
    const timestamp = new Date(`${distributionDate}T${distributionTime}`);

    const distribution = new Distribution({
      stockId,
      distributionType,
      kgDistributed,
      pricePerKg,
      totalPrice: kgDistributed * pricePerKg,
      timestamp,
      centerName
    });

    await distribution.save();
    res.status(201).json(distribution);
  } catch (err) {
    console.error("Distribution error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all distributions
router.get('/', async (req, res) => {
  try {
    const distributions = await Distribution.find().sort('-timestamp');
    res.json(distributions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get or update price settings
router.route('/prices')
  .get(async (req, res) => {
    try {
      let settings = await PriceSetting.findOne();
      if (!settings) {
        // Create default settings if none exist
        settings = new PriceSetting({
          localPrice: 500,
          exportPrice: 800
        });
        await settings.save();
      }
      res.json(settings);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  })
  .post(async (req, res) => {
    try {
      const { localPrice, exportPrice } = req.body;
      
      // Validate prices
      if (localPrice <= 0 || exportPrice <= 0) {
        return res.status(400).json({ error: 'Prices must be positive values' });
      }

      let settings = await PriceSetting.findOne();
      if (!settings) {
        settings = new PriceSetting({ localPrice, exportPrice });
      } else {
        settings.localPrice = localPrice;
        settings.exportPrice = exportPrice;
      }

      await settings.save();
      res.json(settings);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// Get monthly income data
router.get('/monthly-income', async (req, res) => {
  try {
    const incomeData = await Distribution.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" }
          },
          exportIncome: {
            $sum: {
              $cond: [{ $eq: ["$distributionType", "export"] }, "$totalPrice", 0]
            }
          },
          localIncome: {
            $sum: {
              $cond: [{ $eq: ["$distributionType", "local"] }, "$totalPrice", 0]
            }
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    res.json(incomeData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

