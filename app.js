const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

// Initialize the Express application
const app = express();
const port = 3000;

// MongoDB connection setup
let db;
const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectDB() {
    try {
        await client.connect();
        db = client.db('mydatabase'); // specify the database name
        console.log('Connected to Database');
    } catch (err) {
        console.error(err);
    }
}

connectDB();

// Enable CORS for all routes to allow cross-origin requests
app.use(cors());

// Serve static files from the 'public' directory, which includes index.html
app.use(express.static('public'));

// Function to perform calculations and log to the database
async function performOperation(operation, num1, num2, result) {
    if (db) {
        try {
            const collection = db.collection('calculations');
            await collection.insertOne({ operation, num1, num2, result, timestamp: new Date() });
        } catch (err) {
            console.error('Error saving to database:', err);
        }
    }
    return result;
}

// Addition endpoint
app.get('/add', async (req, res) => {
    const num1 = parseFloat(req.query.num1);
    const num2 = parseFloat(req.query.num2);

    if (isNaN(num1) || isNaN(num2)) {
        return res.status(400).json({error: 'Please provide two valid numbers for addition.'});
    }

    const result = num1 + num2;
    await performOperation('add', num1, num2, result);
    res.json({ result });
});

// Subtraction endpoint
app.get('/subtract', async (req, res) => {
    const num1 = parseFloat(req.query.num1);
    const num2 = parseFloat(req.query.num2);

    if (isNaN(num1) || isNaN(num2)) {
        return res.status(400).json({error: 'Please provide two valid numbers for subtraction.'});
    }

    const result = num1 - num2;
    await performOperation('subtract', num1, num2, result);
    res.json({ result });
});

// Multiplication endpoint
app.get('/multiply', async (req, res) => {
    const num1 = parseFloat(req.query.num1);
    const num2 = parseFloat(req.query.num2);

    if (isNaN(num1) || isNaN(num2)) {
        return res.status(400).json({error: 'Please provide two valid numbers for multiplication.'});
    }

    const result = num1 * num2;
    await performOperation('multiply', num1, num2, result);
    res.json({ result });
});

// Division endpoint
app.get('/divide', async (req, res) => {
    const num1 = parseFloat(req.query.num1);
    const num2 = parseFloat(req.query.num2);
  
    if (isNaN(num1) || isNaN(num2)) {
        return res.status(400).json({error: 'Please provide two valid numbers for division.'});
    }

    if (num2 === 0) {
        return res.status(400).json({error: 'Cannot divide by zero.'});
    }

    const result = num1 / num2;
    await performOperation('divide', num1, num2, result);
    res.json({ result });
});

// Start the server
app.listen(port, () => {
    console.log(`Calculator service running at http://localhost:${port}`);
});
