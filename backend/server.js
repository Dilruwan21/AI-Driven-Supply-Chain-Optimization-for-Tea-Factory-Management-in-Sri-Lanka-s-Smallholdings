




require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// ==================== SCHEMA DEFINITIONS ====================

// Factory Manager Schema
const FactoryManagerSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
});
const FactoryManager = mongoose.model('FactoryManager', FactoryManagerSchema);

// Tea Garden Owner Schema
const TeaGardenOwnerSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
});
const TeaGardenOwner = mongoose.model('TeaGardenOwner', TeaGardenOwnerSchema);

// Transport Manager Schema
const TransportManagerSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
});
const TransportManager = mongoose.model('TransportManager', TransportManagerSchema);

// Message Schema
const MessageSchema = new mongoose.Schema({
    senderEmail: String,
    receiverEmail: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
});
const Message = mongoose.model('Message', MessageSchema);

// ==================== ROUTE IMPORTS ====================

// Import Transport Backend Routes
const transportRoutes = require('./transport_backend');
app.use('/tea-transport', transportRoutes);

// Import Finished Tea Routes
const finishedTeaRoutes = require('./routes/finishedTeaRoutes');
app.use('/finished-tea', finishedTeaRoutes);

// Import Wastage Routes
const wastageRoutes = require('./routes/wastageRoutes');
app.use('/api/wastage', wastageRoutes);

// Import Prediction Routes
const predictionRoutes = require('./routes/prediction');
app.use('/api/predictions', predictionRoutes);

// Import Contact Routes
app.use('/api/contact', require('./routes/ContactRoutets'));

// Import Distribution Routes
const distributionRoutes = require('./routes/distribution');
app.use('/distribution', distributionRoutes);

// Import Messages Routes (passing all required models)
const messageRoutes = require('./routes/messages')(
    FactoryManager,
    TransportManager,
    TeaGardenOwner,
    Message
);
app.use('/api/messages', messageRoutes);

// Import Factory Manager Routes
const factoryManagerRoutes = require("./factoryManagerRoutes")(
    TeaGardenOwner,
    TransportManager,
    mongoose.model('Schedule'),
    Message
);
app.use("/factory-manager", factoryManagerRoutes);

// server.js or app.js
const teaPriceRoutes = require('./routes/teaPriceRoutes');

// Add this with your other route imports
app.use('/api/tea-price', teaPriceRoutes);

// In server.js, add this with your other route imports
const accountDetailsRoutes = require('./routes/accountDetails');
app.use('/api/account-details', accountDetailsRoutes);


// ==================== AUTHENTICATION HELPERS ====================

// Common Function for Token Generation
const generateToken = (user) => {
    return jwt.sign({ id: user._id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
};

// Common Signup Function
const signupUser = async (req, res, UserModel, userType) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: `❌ Email already in use for ${userType}` });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: `✅ ${userType} registered successfully` });
    } catch (err) {
        console.error(`${userType} Signup Error:`, err);
        res.status(500).json({ error: `❌ ${userType} signup failed` });
    }
};

// Common Login Function
const loginUser = async (req, res, UserModel, userType) => {
    try {
        const { email, password } = req.body;
        console.log("Login Request Data:", { email, password });

        const user = await UserModel.findOne({ email });

        if (!user) {
            console.log("User not found for email:", email);
            return res.status(400).json({ error: `❌ ${userType} not found` });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log("Invalid password for email:", email);
            return res.status(400).json({ error: "❌ Incorrect password" });
        }

        const token = generateToken(user);
        res.status(200).json({ 
            message: `✅ ${userType} login successful`, 
            token, 
            name: user.name,
            email: user.email
        });
    } catch (err) {
        console.error(`${userType} Login Error:`, err);
        res.status(500).json({ error: `❌ ${userType} login failed` });
    }
};

// ==================== CRON JOBS ====================

// Configure cron job for predictions
if (process.env.NODE_ENV === 'production') {
    cron.schedule('0 2 * * *', () => { // 2 AM daily
        console.log('[CRON] Starting prediction job...');
        
        const pythonProcess = exec(
            'python3 path/to/tea_prediction.py',
            { env: process.env },
            (error, stdout, stderr) => {
                if (error) {
                    console.error('[CRON] Prediction error:', error);
                    return;
                }
                console.log('[CRON] Prediction output:', stdout);
                if (stderr) console.error('[CRON] Prediction stderr:', stderr);
            }
        );
        
        // Timeout after 10 minutes
        setTimeout(() => {
            if (!pythonProcess.killed) {
                console.error('[CRON] Prediction job timed out');
                pythonProcess.kill();
            }
        }, 600000);
    });
}

// ==================== ROUTES ====================


// Factory Manager Routes
app.post('/factory-manager/signup', (req, res) => signupUser(req, res, FactoryManager, "Factory Manager"));
app.post('/factory-manager/login', (req, res) => loginUser(req, res, FactoryManager, "Factory Manager"));

// Tea Garden Owner Routes
app.post('/tea-garden-owner/signup', (req, res) => signupUser(req, res, TeaGardenOwner, "Tea Garden Owner"));
app.post('/tea-garden-owner/login', (req, res) => loginUser(req, res, TeaGardenOwner, "Tea Garden Owner"));

// Transport Manager Routes
app.post('/transport/signup', (req, res) => signupUser(req, res, TransportManager, "Transport Manager"));
app.post('/transport/login', (req, res) => loginUser(req, res, TransportManager, "Transport Manager"));

// ==================== SERVER START ====================

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});


