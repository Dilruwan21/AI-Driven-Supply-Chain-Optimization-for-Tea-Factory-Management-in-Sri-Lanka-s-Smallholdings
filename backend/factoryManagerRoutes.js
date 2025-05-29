

module.exports = (TeaGardenOwner, TransportManager ) => {
    const express = require("express");
    const router = express.Router();

    // ➤ API to Fetch All Tea Garden Owners
    router.get("/tea-garden-owners", async (req, res) => {
        try {
            const teaGardenOwners = await TeaGardenOwner.find();
            res.json(teaGardenOwners);
        } catch (err) {
            res.status(500).json({ error: "❌ Error fetching tea garden owners" });
        } 
    });

    // ➤ API to Fetch All Transport Managers
    router.get("/transport-managers", async (req, res) => {
        try {
            const transportManagers = await TransportManager.find();
            res.json(transportManagers);
        } catch (err) {
            res.status(500).json({ error: "❌ Error fetching transport managers" });
        }
    });

    // ➤ API to Send Daily Schedule to a Specific Transport Manager
    // router.post("/send-schedule", async (req, res) => {
    //     try {
    //         const { transportManagerId, schedule } = req.body;

    //         const newSchedule = new Schedule({
    //             transportManagerId,
    //             schedule,
    //             timestamp: new Date(),
    //         });
    //         await newSchedule.save();

    //         res.status(201).json({ message: "✅ Schedule sent successfully" });
    //     } catch (err) {
    //         res.status(500).json({ error: "❌ Error sending schedule" });
    //     }
    // });

   

return router;
};





