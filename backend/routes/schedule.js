const express = require('express');
const router = express.Router();
const Schedule = require('../transport_backend');


// // Create a new schedule
// router.post('/', async (req, res) => {
//   try {
//     const { transportManagerId, transportManagerEmail, date, gardens, notes } = req.body;
    
//     // Validate transport manager exists
//     const managerExists = await TransportManager.findById(transportManagerId);
//     if (!managerExists) {
//       return res.status(404).json({ error: 'Transport manager not found' });
//     }

//     // Validate gardens exist
//     for (const garden of gardens) {
//       const gardenExists = await TeaGardenOwner.findById(garden.gardenId);
//       if (!gardenExists) {
//         return res.status(404).json({ error: `Garden ${garden.gardenName} not found` });
//       }
//     }

//     const newSchedule = new Schedule({
//       transportManagerId,
//       transportManagerEmail,
//       date: date || new Date(),
//       gardens: gardens.map(garden => ({
//         gardenId: garden.gardenId,
//         gardenName: garden.gardenName,
//         address: garden.address || '',
//         expectedQuantity: garden.expectedQuantity || null,
//         priority: garden.priority || 'medium',
//         status: 'pending'
//       })),
//       notes
//     });

//     await newSchedule.save();
//     res.status(201).json(newSchedule);
//   } catch (err) {
//     console.error('Error creating schedule:', err);
//     res.status(500).json({ error: 'Error creating schedule' });
//   }
// });

// // Get all schedules
// router.get('/', async (req, res) => {
//   try {
//     const schedules = await Schedule.find()
//       .sort({ date: -1, createdAt: -1 })
//       .populate('transportManagerId', 'name email')
//       .populate('gardens.gardenId', 'name email phone address');
    
//     res.json(schedules);
//   } catch (err) {
//     console.error('Error fetching schedules:', err);
//     res.status(500).json({ error: 'Error fetching schedules' });
//   }
// });

// // Get schedules for a specific transport manager
// router.get('/transport-manager/:managerId', async (req, res) => {
//   try {
//     const schedules = await Schedule.find({
//       transportManagerId: req.params.managerId
//     })
//     .sort({ date: -1 })
//     .populate('gardens.gardenId', 'name email phone address');
    
//     res.json(schedules);
//   } catch (err) {
//     console.error('Error fetching schedules:', err);
//     res.status(500).json({ error: 'Error fetching schedules' });
//   }
// });

// // Update garden status in a schedule
// router.patch('/:scheduleId/status', async (req, res) => {
//   try {
//     const { gardenId, status } = req.body;
    
//     if (!['pending', 'in-progress', 'completed'].includes(status)) {
//       return res.status(400).json({ error: 'Invalid status' });
//     }

//     const update = gardenId
//       ? { $set: { "gardens.$[elem].status": status } }
//       : { $set: { status } };
    
//     const options = gardenId
//       ? {
//           arrayFilters: [{ "elem.gardenId": gardenId }],
//           new: true
//         }
//       : { new: true };
    
//     const updatedSchedule = await Schedule.findByIdAndUpdate(
//       req.params.scheduleId,
//       update,
//       options
//     ).populate('gardens.gardenId', 'name email phone address');
    
//     if (!updatedSchedule) {
//       return res.status(404).json({ error: "Schedule not found" });
//     }
    
//     res.json(updatedSchedule);
//   } catch (err) {
//     console.error("Error updating schedule status:", err);
//     res.status(500).json({ error: "Error updating schedule status" });
//   }
// });


router.get('/', async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('transportManagerId', 'name email')
      .populate('gardens.gardenId', 'name address');
    res.json(schedules);
  } catch (err) {
    console.error('Error fetching schedules:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new schedule
router.post('/', async (req, res) => {
  try {
    const newSchedule = new Schedule(req.body);
    await newSchedule.save();
    res.status(201).json(newSchedule);
  } catch (err) {
    console.error('Error creating schedule:', err);
    res.status(400).json({ error: 'Invalid data' });
  }
});
module.exports = router;