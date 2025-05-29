const express = require('express');
const router = express.Router();
const Contact = require('../models/contactModel');

// Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    const newContact = new Contact({
      name,
      email,
      phone,
      subject,
      message
    });

    await newContact.save();
    res.status(201).json({ message: 'Contact form submitted successfully' });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all contact form submissions
router.get('/', async (req, res) => {
    try {
      const contacts = await Contact.find().sort({ createdAt: -1 }).limit(10); // Get latest 10 submissions
      res.json(contacts);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;