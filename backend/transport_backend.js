






const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Import models
const Wastage = require('./models/Wastage'); // Make sure path is correct to your Wasted.js file

// //Tea Transport Schema
// const TeaTransportSchema = new mongoose.Schema({
//   gardenOwner: String,
//   gardenName: String,
//   teaKilos: Number,
//   remainingKilos: Number,
//   transportDate: { type: Date, default: Date.now },
//   pricePerKg: Number,
//   totalAmount: Number,
//   status: {
//     type: String,
//     enum: ['available', 'partially_used', 'exhausted'],
//     default: 'available'
//   }
// });
// const TeaTransport = mongoose.model('TeaTransport', TeaTransportSchema);

// Update the TeaTransportSchema in your backend
const TeaTransportSchema = new mongoose.Schema({
  gardenOwner: String,
  gardenOwnerEmail: String,
  transportManagerEmail: String, // Add this line
  gardenName: String,
  teaKilos: Number,
  remainingKilos: Number,
  transportDate: { type: Date, default: Date.now },
  pricePerKg: Number,
  totalAmount: Number,
  status: {
    type: String,
    enum: ['available', 'partially_used', 'exhausted'],
    default: 'available'
  },
  billNumber: {
    type: String,
    unique: true
  },
  billStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  billDate: {
    type: Date,
    default: Date.now
  }
});

const TeaTransport = mongoose.model('TeaTransport', TeaTransportSchema);


// Stock Schema
const StockSchema = new mongoose.Schema({
  stockId: String,
  kgProduced: Number,
  rawTeaUsed: Number,
  wastage: Number,
  date: Date,
  sources: [{
    transportId: mongoose.Schema.Types.ObjectId,
    gardenOwner: String,
    gardenName: String,
    allocated: Number,
    remaining: Number
  }]
});
const Stock = mongoose.model('Stock', StockSchema);

// Message Schema
// const MessageSchema = new mongoose.Schema({
//   sender: String,
//   receiver: String,
//   message: String,
//   timestamp: { type: Date, default: Date.now },
// });
// const Message = mongoose.model('Message', MessageSchema);

// Schedule Schema
// const ScheduleSchema = new mongoose.Schema({
//   transportManagerId: String,
//   schedule: String,
//   timestamp: { type: Date, default: Date.now },
// });
// const Schedule = mongoose.model('Schedule', ScheduleSchema);


const scheduleSchema = new mongoose.Schema({
  transportManagerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'TransportManager', 
    required: true 
  },
  transportManagerEmail: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true, 
    default: Date.now 
  },
  gardens: [{
    gardenId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'TeaGardenOwner' 
    },
    gardenName: { 
      type: String, 
      required: true 
    },
    address: String,
    expectedQuantity: Number,
    priority: { 
      type: String, 
      enum: ['high', 'medium', 'low'], 
      default: 'medium' 
    },
    status: { 
      type: String, 
      enum: ['pending', 'in-progress', 'completed'], 
      default: 'pending' 
    }
  }],
  notes: String,
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

scheduleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create and export the Schedule model
const Schedule = mongoose.model('Schedule', scheduleSchema);

// Add schedule-related routes to your transport backend
router.post('/schedules', async (req, res) => {
  try {
    const {
      transportManagerId,
      transportManagerEmail,
      date,
      gardens,
      notes
    } = req.body;

    const newSchedule = new Schedule({
      transportManagerId,
      transportManagerEmail,
      date,
      gardens,
      notes
    });

    await newSchedule.save();
    res.status(201).json(newSchedule);
  } catch (err) {
    console.error('Error creating schedule:', err);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

router.get('/schedules', async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .sort({ createdAt: -1 })
      .populate('transportManagerId', 'name email')
      .populate('gardens.gardenId', 'name address');
    
    res.json(schedules);
  } catch (err) {
    console.error('Error fetching schedules:', err);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// Add Transport
// router.post('/add-transport', async (req, res) => {
//   try {
//     const { gardenOwner, gardenName, teaKilos, transportDate, pricePerKg, totalAmount } = req.body;
//     const newTransport = new TeaTransport({
//       gardenOwner,
//       gardenName,
//       teaKilos,
//       remainingKilos: teaKilos,
//       transportDate: new Date(transportDate),
//       pricePerKg,
//       totalAmount,
//     });
//     await newTransport.save();
//     res.status(201).json({ message: "✅ Tea transport data added successfully" });
//   } catch (err) {
//     res.status(500).json({ error: "❌ Error adding data" });
//   }
// });

// Allocate Batch
router.post('/allocate-batch', async (req, res) => {
  try {
    const { batchSize } = req.body;
    
    // Enhanced validation
    if (![500, 1000].includes(batchSize)) {
      return res.status(400).json({
        error: "Batch size must be exactly 500 or 1000 kg",
        validSizes: [500, 1000]
      });
    }

    // Verify tea transports have valid remainingKilos
    const availableTea = await TeaTransport.find({
      remainingKilos: { $gt: 0 }
    }).sort({ transportDate: 1 });

    if (!availableTea || availableTea.length === 0) {
      return res.status(400).json({
        error: "No available raw tea in inventory",
        availableQuantity: 0
      });
    }

    // Calculate total available
    const totalAvailable = availableTea.reduce((sum, t) => sum + t.remainingKilos, 0);
    
    if (totalAvailable < batchSize) {
      return res.status(400).json({
        error: `Insufficient raw tea. Requested: ${batchSize}kg, Available: ${totalAvailable}kg`,
        availableQuantity: totalAvailable
      });
    }

    // Allocation logic remains same
    let remainingToAllocate = batchSize;
    const allocations = [];
    const updates = [];

    for (const transport of availableTea) {
      if (remainingToAllocate <= 0) break;

      const allocateAmount = Math.min(transport.remainingKilos, remainingToAllocate);
      
      allocations.push({
        transportId: transport._id,
        gardenOwner: transport.gardenOwner,
        gardenName: transport.gardenName,
        allocated: allocateAmount,
        remaining: transport.remainingKilos - allocateAmount
      });

      transport.remainingKilos -= allocateAmount;
      transport.status = transport.remainingKilos > 0 ? 'partially_used' : 'exhausted';
      updates.push(transport.save());

      remainingToAllocate -= allocateAmount;
    }

    await Promise.all(updates);
    
    res.json({
      success: true,
      batchSize,
      allocations,
      totalAllocated: batchSize - remainingToAllocate,
      remainingInventory: totalAvailable - batchSize
    });

  } catch (err) {
    console.error("Allocation error:", err);
    res.status(500).json({
      error: "Batch allocation failed",
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});
// Add Stock
router.post('/add-stock', async (req, res) => {
  try {
    const { stockId, kgProduced, rawTeaUsed, wastage, date, sources } = req.body;
    
    // Validation
    if (!stockId || !kgProduced || !rawTeaUsed || !sources) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["stockId", "kgProduced", "rawTeaUsed", "sources"]
      });
    }

    if (sources.length === 0) {
      return res.status(400).json({ error: "Sources array cannot be empty" });
    }

    const newStock = new Stock({
      stockId,
      kgProduced,
      rawTeaUsed,
      wastage: wastage || 0,
      date: date ? new Date(date) : new Date(),
      sources
    });

    await newStock.save();
    
    res.status(201).json({
      message: "Stock record created successfully",
      stock: newStock
    });
  } catch (err) {
    console.error("Stock creation error:", err);
    res.status(500).json({
      error: "Error creating stock record",
      details: err.message
    });
  }
});

// Record Wastage
router.post('/record-wastage', async (req, res) => {
  try {
    const { kgs, reason, date, batchId } = req.body;
    
    const newWastage = new Wastage({
      kgs,
      reason,
      date,
      batchId
    });

    await newWastage.save();
    
    res.status(201).json({
      message: "Wastage recorded successfully",
      wastage: newWastage
    });
  } catch (err) {
    res.status(500).json({ error: "Error recording wastage" });
  }
});

// Get Garden Owners
router.get('/get-garden-owners', async (req, res) => {
  try {
    const gardenOwners = await mongoose.connection.db.collection("teagardenowners").find().toArray();
    res.json(gardenOwners);
  } catch (err) {
    res.status(500).json({ error: "❌ Error fetching garden owners" });
  }
});

// Get Factory Managers
router.get('/get-factory-managers', async (req, res) => {
  try {
    const factoryManagers = await mongoose.connection.db.collection("factorymanagers").find().toArray();
    res.json(factoryManagers);
  } catch (err) {
    res.status(500).json({ error: "Error fetching factory managers" });
  }
});

// Get Transports
router.get('/get-transports', async (req, res) => {
  try {
    const transports = await TeaTransport.find();
    res.json(transports);
  } catch (err) {
    res.status(500).json({ error: "❌ Error fetching data" });
  }
});

// Get Transports by Garden Owner
router.get('/get-transports/:gardenOwner', async (req, res) => {
  try {
    const { gardenOwner } = req.params;
    const transports = await TeaTransport.find({ gardenOwner });
    res.json(transports);
  } catch (err) {
    res.status(500).json({ error: "❌ Error fetching data" });
  }
});

// Get Schedules
router.get('/get-schedules/:transportManagerId', async (req, res) => {
  try {
    const { transportManagerId } = req.params;
    const schedules = await Schedule.find({ transportManagerId });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: "❌ Error fetching schedules" });
  }
});

// Factory Manager List
router.get('/factory-manager/list', async (req, res) => {
  try {
    const factoryManagers = await mongoose.connection.db.collection("factorymanagers").find().toArray();
    res.json(factoryManagers);
  } catch (err) {
    res.status(500).json({ error: "Error fetching factory managers" });
  }
});

// Transport Manager List
router.get('/transport-manager/list', async (req, res) => {
  try {
    const transportManagers = await mongoose.connection.db.collection("transportmanagers").find().toArray();
    res.json(transportManagers);
  } catch (err) {
    res.status(500).json({ error: "Error fetching transport managers" });
  }
});


router.post('/remove-raw-tea', async (req, res) => {
  try {
    const { transportId, kgsUsed } = req.body;
    const transport = await TeaTransport.findById(transportId);
    
    if (!transport) return res.status(404).json({ error: "Transport not found" });
    if (kgsUsed <= 0) return res.status(400).json({ error: "Invalid quantity" });
    if (transport.remainingKilos < kgsUsed) {
      return res.status(400).json({ 
        error: `Not enough tea (Available: ${transport.remainingKilos}kg, Requested: ${kgsUsed}kg)`
      });
    }

    transport.remainingKilos -= kgsUsed;
    
    if (transport.remainingKilos <= 0) {
      await TeaTransport.findByIdAndDelete(transportId);
    } else {
      await transport.save();
    }

    res.json({ 
      message: "Update successful",
      remaining: transport.remainingKilos > 0 ? transport.remainingKilos : 0
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


// Add this route to check transport data integrity
router.get('/validate-transports', async (req, res) => {
  try {
    const transports = await TeaTransport.find();
    const invalidTransports = transports.filter(t =>
      t.remainingKilos > t.teaKilos ||
      t.remainingKilos < 0
    );
    
    res.json({
      totalTransports: transports.length,
      invalidTransports: invalidTransports.length,
      details: invalidTransports
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get Payment Data
router.get('/payment-data', async (req, res) => {
  try {
    const paymentData = await TeaTransport.aggregate([
      {
        $group: {
          _id: {
            gardenOwner: "$gardenOwner",
            year: { $year: "$transportDate" },
            month: { $month: "$transportDate" }
          },
          totalKgs: { $sum: "$teaKilos" },
          totalAmount: { $sum: "$totalAmount" },
          transports: { $push: "$$ROOT" }
        }
      },
      {
        $sort: {
          "_id.year": -1,
          "_id.month": -1
        }
      }
    ]);

    res.json(paymentData);
  } catch (err) {
    console.error("Payment data error:", err);
    res.status(500).json({ error: "Error fetching payment data" });
  }
});


// Add this route to get schedules for a specific transport manager
router.get('/schedules/:transportManagerId', async (req, res) => {
  try {
    const { transportManagerId } = req.params;
    const schedules = await Schedule.find({ transportManagerId })
      .sort({ date: -1 })
      .populate('gardens.gardenId', 'name address');
    
    res.json(schedules);
  } catch (err) {
    console.error('Error fetching schedules:', err);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// Add this route to update garden status in a schedule
router.put('/schedules/:scheduleId/garden/:gardenIndex', async (req, res) => {
  try {
    const { scheduleId, gardenIndex } = req.params;
    const { status } = req.body;

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    if (gardenIndex >= schedule.gardens.length) {
      return res.status(400).json({ error: 'Invalid garden index' });
    }

    schedule.gardens[gardenIndex].status = status;
    await schedule.save();

    res.json(schedule);
  } catch (err) {
    console.error('Error updating garden status:', err);
    res.status(500).json({ error: 'Failed to update garden status' });
  }
});







// Add these routes to your backend

// Generate a unique bill number
function generateBillNumber() {
  const prefix = 'BILL';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

// Create a new bill
// Replace the existing /add-transport route with this one:
router.post('/add-transport', async (req, res) => {
  try {
    const { gardenOwner, gardenName, teaKilos, transportDate, pricePerKg, totalAmount, gardenOwnerEmail } = req.body;
    
    const newTransport = new TeaTransport({
      gardenOwner,
      gardenOwnerEmail,
      gardenName,
      teaKilos,
      remainingKilos: teaKilos,
      transportDate: new Date(transportDate),
      pricePerKg,
      totalAmount,
      billNumber: generateBillNumber(),
      billStatus: 'pending',
      transportManagerEmail: req.body.transportManagerEmail // Add this line
    });
    
    await newTransport.save();
    res.status(201).json({
      message: "✅ Tea transport data added successfully",
      billNumber: newTransport.billNumber,
      _id: newTransport._id
    });
  } catch (err) {
    console.error("Error adding transport:", err);
    res.status(500).json({ 
      error: "❌ Error adding data",
      details: err.message
    });
  }
});
// Update this route in your backend
router.get('/bills/garden-owner/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log(`Fetching bills for: ${email}`);
    
    // Get bills where either:
    // 1. The garden owner is this email (for garden owners)
    // 2. The transport manager is this email (for transport managers)
    const bills = await TeaTransport.find({
      $or: [
        { gardenOwnerEmail: email },
        { transportManagerEmail: email }  // Add this if you track who created the transport
      ]
    }).sort({ transportDate: -1 });
    
    console.log(`Found ${bills.length} bills`);
    res.json(bills);
  } catch (err) {
    console.error("Error fetching bills:", err);
    res.status(500).json({ error: "Error fetching bills" });
  }
});
// Get all pending bills
router.get('/bills/pending', async (req, res) => {
  try {
    const bills = await TeaTransport.find({ billStatus: 'pending' })
      .sort({ transportDate: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: "Error fetching pending bills" });
  }
});

// Confirm payments (mark bills as paid)
router.post('/confirm-payments', async (req, res) => {
  try {
    const { billIds } = req.body;
    
    // Update all selected bills to paid status
    const result = await TeaTransport.updateMany(
      { _id: { $in: billIds } },
      { 
        $set: { 
          billStatus: 'paid',
          paymentDate: new Date() 
        } 
      }
    );

    res.json({
      success: true,
      updatedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("Payment confirmation error:", err);
    res.status(500).json({ error: "Failed to confirm payments" });
  }
});

// Add this route to get payment history
router.get('/payment-history', async (req, res) => {
  try {
    const paidBills = await TeaTransport.find({ 
      billStatus: 'paid'
    }).sort({ paymentDate: -1 });
    
    res.json(paidBills);
  } catch (err) {
    console.error("Payment history error:", err);
    res.status(500).json({ error: "Error fetching payment history" });
  }
});








const axios = require('axios');
const cheerio = require('cheerio');
router.get('/api/scrape-tea-news', async (req, res) => {
  try {
    const sources = [
      {
        url: 'https://discoveringtea.com/category/tea-production/',
        baseUrl: 'https://discoveringtea.com',
        selector: 'article',
        title: 'h2.entry-title',
        link: 'h2.entry-title a',
        summary: '.entry-content p',
        image: '.post-thumbnail img'
      },
      {
        url: 'https://worldteadirectory.com/category/tea-production/',
        baseUrl: 'https://worldteadirectory.com',
        selector: '.article',
        title: 'h2 a',
        link: 'h2 a',
        summary: '.entry-content p',
        image: '.post-image img'
      }
    ];

    const articles = [];

    for (const source of sources) {
      try {
        console.log(`Fetching ${source.url}`);
        const response = await axios.get(source.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        const $ = cheerio.load(response.data);

        $(source.selector).each(function() {
          const title = $(this).find(source.title).text().trim();
          const url = $(this).find(source.link).attr('href');
          const summary = $(this).find(source.summary).first().text().trim();
          const image = $(this).find(source.image).attr('src');

          if (title && url) {
            articles.push({
              title,
              url: url.startsWith('http') ? url : `${source.baseUrl}${url}`,
              summary: summary || 'Click to read more...',
              image: image || 'default-tea-image.jpg',
              source: source.baseUrl.replace('https://', ''),
              date: new Date().toISOString().split('T')[0]
            });
          }
        });
      } catch (err) {
        console.error(`Error scraping ${source.url}:`, err.message);
        // Continue to next source even if one fails
      }
    }

    if (articles.length === 0) {
      // Return some default articles if scraping fails
      articles.push({
        title: "Minimize Tea Transport Damage",
        content: "Ensure quick transport to prevent fermentation",
        source: "System",
        image: "default-tea-image.jpg",
        date: new Date().toISOString().split('T')[0]
      });
    }

    res.json(articles);
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ 
      error: 'Failed to scrape news',
      details: error.message 
    });
  }
});


module.exports = router;




