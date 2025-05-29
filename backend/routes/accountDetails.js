const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Account Details Schema
const AccountDetailsSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  beneficiaryName: { type: String, required: true },
  branch: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save hook to update the updatedAt field
AccountDetailsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const AccountDetails = mongoose.model('AccountDetails', AccountDetailsSchema);

// Get account details for a user
// Change the GET endpoint in routes/accountDetails.js
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const accountDetails = await AccountDetails.findOne({ email });
    
    // Return empty object if not found (instead of 404)
    res.json(accountDetails || {});
  } catch (err) {
    console.error('Error fetching account details:', err);
    res.status(500).json({ error: 'Failed to fetch account details' });
  }
});

// Update the POST route to handle both create and update
router.post('/', async (req, res) => {
  try {
    const { email, bankName, accountNumber, beneficiaryName, branch } = req.body;
    
    // Validate required fields
    if (!email || !bankName || !accountNumber || !beneficiaryName || !branch) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Use findOneAndUpdate with upsert option
    const updatedDetails = await AccountDetails.findOneAndUpdate(
      { email },
      {
        bankName,
        accountNumber,
        beneficiaryName,
        branch,
        updatedAt: new Date()
      },
      {
        new: true,       // Return the updated document
        upsert: true,    // Create if doesn't exist
        runValidators: true // Run schema validations
      }
    );
    
    res.json(updatedDetails);
  } catch (err) {
    console.error('Error saving account details:', err);
    res.status(500).json({ error: 'Failed to save account details' });
  }
});

// Remove the PUT endpoint since we're handling updates via POST
// Delete account details
router.delete('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const deletedDetails = await AccountDetails.findOneAndDelete({ email });
    
    if (!deletedDetails) {
      return res.status(404).json({ message: 'Account details not found' });
    }
    
    res.json({ message: 'Account details deleted successfully' });
  } catch (err) {
    console.error('Error deleting account details:', err);
    res.status(500).json({ error: 'Failed to delete account details' });
  }
});




module.exports = router;