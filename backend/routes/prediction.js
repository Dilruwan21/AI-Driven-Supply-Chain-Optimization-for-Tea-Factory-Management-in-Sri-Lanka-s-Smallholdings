


const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const Prediction = require('../models/prediction');

// POST endpoint for running predictions
router.post('/run-model/:owner', async (req, res) => {
    const startTime = Date.now();
    const owner = req.params.owner;
    console.log(`🚀 Starting prediction process for ${owner}`);

    const pythonScriptPath = path.join(__dirname, '../../ai-model/ai_model.py');
    const pythonProcess = spawn('python', [pythonScriptPath], {
        env: {
            ...process.env,
            PREDICTION_OWNER: owner,
            COLLECTION_NAME: 'teatransports',
            FORCE_REFRESH: '1',
            PYTHONUNBUFFERED: '1'
        },
        timeout: 120000
    });

    let outputLog = '';
    let errorLog = '';

    pythonProcess.stdout.on('data', (data) => {
        const message = data.toString();
        outputLog += message;
        console.log(`[Model Output] ${message.trim()}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        const errorMessage = data.toString();
        errorLog += errorMessage;
        console.error(`[Model Error] ${errorMessage.trim()}`);
    });

    pythonProcess.on('close', async (code) => {
        const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`Process exited with code ${code} after ${executionTime}s`);

        try {
            if (code !== 0) {
                throw new Error(errorLog.split('\n').find(line => line.includes('ERROR')) || 'Model execution failed');
            }

            const prediction = await Prediction.findOne({
                owner: owner,
                month: { $gte: new Date().toISOString().slice(0, 7) }
            }).sort({ month: -1 });

            if (!prediction) {
                throw new Error('Predictions not found after update');
            }

            res.json({
                success: true,
                message: 'Predictions updated successfully',
                data: prediction,
                logs: {
                    output: outputLog,
                    warnings: errorLog
                }
            });

        } catch (err) {
            console.error('Prediction completion error:', err);
            res.status(500).json({
                success: false,
                message: err.message,
                error: errorLog,
                logs: outputLog
            });
        }
    });

    pythonProcess.on('error', (err) => {
        console.error('Process spawn error:', err);
        res.status(500).json({
            success: false,
            message: `Failed to start prediction process: ${err.message}`
        });
    });

    pythonProcess.on('timeout', () => {
        console.error('Process timed out');
        pythonProcess.kill();
        res.status(504).json({
            success: false,
            message: 'Model execution timed out (2 minutes)'
        });
    });
});

// GET endpoint for fetching predictions (correctly placed outside POST route)
router.get('/:owner', async (req, res) => {
    try {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const prediction = await Prediction.findOne({
            owner: req.params.owner,
            month: { $gte: currentMonth }
        }).sort({ month: -1 });

        if (!prediction) {
            return res.status(404).json({ 
                success: false,
                message: 'No predictions found' 
            });
        }

        res.json({
            success: true,
            data: prediction
        });
    } catch (err) {
        console.error('Prediction fetch error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
});

module.exports = router;