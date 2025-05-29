const express = require('express');
const router = express.Router();

module.exports = function(FactoryManager, TransportManager, TeaGardenOwner, Message) {
  // Get messages for user
  router.get('/:email', async (req, res) => {
    try {
      const messages = await Message.find({
        $or: [
          { senderEmail: req.params.email },
          { receiverEmail: req.params.email }
        ]
      }).sort({ timestamp: -1 });
      res.json(messages);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  // Send message
  router.post('/send', async (req, res) => {
    try {
      const newMessage = new Message({
        senderEmail: req.body.senderEmail,
        receiverEmail: req.body.receiverEmail,
        message: req.body.message
      });
      
      await newMessage.save();
      res.status(201).json({ message: 'Message sent successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // // Get all potential recipients
  // router.get('/recipients/all', async (req, res) => {
  //   try {
  //     const [factoryManagers, gardenOwners] = await Promise.all([
  //       FactoryManager.find({}, 'email name').then(managers => 
  //         managers.map(m => ({ ...m.toObject(), role: 'factoryManager' }))
  //       ),
  //       TeaGardenOwner.find({}, 'email name').then(owners => 
  //         owners.map(o => ({ ...o.toObject(), role: 'gardenOwner' }))
  //       )
  //     ]);
      
  //     res.json({
  //       factoryManagers,
  //       gardenOwners,
  //       allRecipients: [...factoryManagers, ...gardenOwners]
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).json({ error: 'Failed to fetch recipients' });
  //   }
  // });
  
  // In your routes/messages.js
router.get('/recipients/all', async (req, res) => {
  try {
    const [factoryManagers, transportManagers, gardenOwners] = await Promise.all([
      FactoryManager.find({}, 'email name').then(managers => 
        managers.map(m => ({ ...m.toObject(), role: 'factoryManager' }))
      ),
      TransportManager.find({}, 'email name').then(managers => 
        managers.map(m => ({ ...m.toObject(), role: 'transportManager' }))
      ),
      TeaGardenOwner.find({}, 'email name').then(owners => 
        owners.map(o => ({ ...o.toObject(), role: 'gardenOwner' }))
      )
    ]);
    
    res.json({
      factoryManagers,
      transportManagers,
      gardenOwners,
      allRecipients: [...factoryManagers, ...transportManagers, ...gardenOwners]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recipients' });
  }
});

  return router;
};