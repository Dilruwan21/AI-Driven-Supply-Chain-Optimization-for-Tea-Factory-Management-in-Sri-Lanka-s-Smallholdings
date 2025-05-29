const express = require('express');
const router = express.Router();
const Wastage = require('../models/Wastage'); // Make sure path is correct

// GET all wastage records
router.get('/', async (req, res) => {
  try {
    const wastage = await Wastage.find().sort({ date: -1 });
    res.json(wastage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new wastage record
router.post('/', async (req, res) => {
  try {
    const { kgs, reason, date, batchId } = req.body;
    
    // Validation
    if (!kgs || !reason) {
      return res.status(400).json({
        error: "Missing required fields (kgs, reason)"
      });
    }

    const newWastage = new Wastage({
      kgs,
      reason,
      date: date || new Date(),
      batchId
    });

    const savedWastage = await newWastage.save();
    res.status(201).json(savedWastage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET wastage by batch ID
router.get('/batch/:batchId', async (req, res) => {
  try {
    const wastage = await Wastage.find({ batchId: req.params.batchId });
    res.json(wastage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a wastage record
router.delete('/:id', async (req, res) => {
  try {
    const deletedWastage = await Wastage.findByIdAndDelete(req.params.id);
    if (!deletedWastage) {
      return res.status(404).json({ error: "Wastage record not found" });
    }
    res.json({ message: "Wastage record deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


