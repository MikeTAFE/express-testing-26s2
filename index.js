// Testing the Express.js framework

// TESTING
// console.log("Hi there, Silverians!")

// Require and configure Express.js
const express = require('express');
const app = express();
const port = 3000;

// Enable built-in JSON parsing middleware
// Middleware in Express, is automatically applied to requests
// Automatically parses/translates incoming JSON data
app.use(express.json());

// Require Mongoose package
const mongoose = require('mongoose');

// Include Mongoose models
const Country = require("./models/Country");

// GET /
app.get('/', (req, res) => {
    // This is a simple text string
    res.send('Hello Silver students!');
});

// GET /secret
app.get('/secret', (req, res) => {

    // This is simple HTML
    res.send(`
        <h1>Secret content</h1>
        <p>This is totally secret!</p>
    `);
});

// GET /json-data
app.get('/json-data', (req, res) => {

    // This is sending some JSON data in the response

    // Define an object that will be sent as JSON
    const data = {
        id: 123,
        name: "Fish Toothbrush",
        price: 34.56,
        categories: ["hygiene", "pets", "dental"],
    };

    res.send(data);
});

// GET /countries/au
// This endpoint/route takes a named parameter, which is used inside the handler
app.get('/countries/:code', (req, res) => {

    // Get parameters
    const countryCode = req.params.code.toLowerCase();

    // TODO: validation?

    // TESTING
    // console.log({countryCode});

    // Country list (defined as object/map)
    const countries = {
        au: "Australia",
        nz: "New Zealand",
        cn: "China",
        ch: "Switzerland",
        at: "Austria",
        kr: "Korea",
    };

    // Check if country code not found
    if (!Object.hasOwn(countries, countryCode)) {
        return res.status(404).send({message: `Country with code '${countryCode.toUpperCase()}' not found`});
    }

    // Send country data (JSON)
    // Get country name from the list
    res.status(200).send({
        code: countryCode,
        name: countries[countryCode],
    });
});



/*
 * Country endpoints (MongoDB)
 */

// GET /api/countries
app.get('/api/countries', async (req, res) => {
    
    // Find all countries with projection and sorting
    // .lean() returns plain old JavaScript objects (POJOs) instead of heavy Mongoose Document objects
    const countries = await Country.find()
        .select({_id: 0, __v: 0})
        .sort({code: 1})
        .lean();
    
    // Send response
    res.status(200).send(countries);
});

// POST /api/countries
app.post('/api/countries', async (req, res) => {
    
    try {
        // Build a new object
        const country = new Country({
            code: req.body?.code,
            name: req.body?.name,
        });

        // Add/save to database (insert) with schema validation
        await country.save();
        
        // Send response (201 = Created)
        res.status(201).send(country);
    } catch (err) {
        // Handle Mongoose schema validation errors
        if (err.name === 'ValidationError') {
            return res.status(400).send({ message: err.message });
        }
        // Handle duplicate key error (code already exists)
        if (err.code === 11000) {
            return res.status(409).send({ message: "Country with this code already exists" });
        }
        res.status(500).send({ message: err.message });
    }
});

// GET /api/countries/:code
app.get('/api/countries/:code', async (req, res) => {
    
    // Get parameters
    const countryCode = req.params.code;

    // Find matching country
    const country = await Country.findOne({code: countryCode})
        .select({_id: 0, __v: 0})
        .lean();
    
    // Check if country found
    if (country == null) {
        return res.status(404).send({message: "Country not found"});
    }

    // Send response
    res.status(200).send(country);
});

// PUT /api/countries/:code (Replace)
app.put('/api/countries/:code', async (req, res) => {

    try {
        // Get parameters
        const countryCode = req.params.code;

        // Check if code in body matches URL parameter
        if (req.body?.code !== undefined && req.body.code !== countryCode) {
            return res.status(400).send({ message: "Country code in body does not match URL parameter" });
        }

        // Validate complete document against Country schema
        const countryDoc = new Country({
            code: countryCode,
            name: req.body?.name,
        });
        await countryDoc.validate();

        // Replace matching document with new data
        const country = await Country.findOneAndReplace(
            { code: countryCode },
            { code: countryCode, name: req.body.name },
            { returnDocument: 'after', runValidators: true }
        )
            .select({ _id: 0, __v: 0 })
            .lean();

        // Check if country found
        if (country == null) {
            return res.status(404).send({ message: "Country not found" });
        }

        // Send response
        res.status(200).send(country);
    } catch (err) {
        // Handle Mongoose schema validation errors
        if (err.name === 'ValidationError') {
            return res.status(400).send({ message: err.message });
        }
        res.status(500).send({ message: err.message });
    }
});

// PATCH /api/countries/:code (Update)
app.patch('/api/countries/:code', async (req, res) => {

    try {
        // Get parameters
        const countryCode = req.params.code;

        // Check if code in body matches URL parameter
        if (req.body?.code !== undefined && req.body.code !== countryCode) {
            return res.status(400).send({ message: "Country code in body does not match URL parameter" });
        }

        // Validate name against schema
        const countryDoc = new Country({
            code: countryCode,
            name: req.body?.name,
        });
        await countryDoc.validate(['name']);

        // Update only allowed fields (code remains immutable)
        const country = await Country.findOneAndUpdate(
            { code: countryCode },
            { $set: { name: req.body.name } },
            { returnDocument: 'after', runValidators: true }
        )
            .select({ _id: 0, __v: 0 })
            .lean();

        // Check if country found
        if (country == null) {
            return res.status(404).send({ message: "Country not found" });
        }

        // Send response
        res.status(200).send(country);
    } catch (err) {
        // Handle Mongoose schema validation errors
        if (err.name === 'ValidationError') {
            return res.status(400).send({ message: err.message });
        }
        res.status(500).send({ message: err.message });
    }
});

// DELETE /api/countries/:code
app.delete('/api/countries/:code', async (req, res) => {

    try {
        // Get parameters
        const countryCode = req.params.code;

        // Check if code in body matches URL parameter
        if (req.body?.code !== undefined && req.body.code !== countryCode) {
            return res.status(400).send({ message: "Country code in body does not match URL parameter" });
        }

        // Find and remove matching country
        const country = await Country.findOneAndDelete({ code: countryCode });

        // Check if country found
        if (country == null) {
            return res.status(404).send({ message: "Country not found" });
        }

        // Send response (204 No Content)
        res.status(204).send();
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});



// async wrapper function
async function main() {

    // Connect to MongoDB instance/database
    await mongoose.connect('mongodb://localhost:27017/test');

    // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled

    console.log("Connected to MongoDB database");

    // Start the Express web server listening (waiting for connections)
    app.listen(port, () => {
        console.log(`Testing Express App is listening on port ${port}`);
    });
}

// Run the main function, catch any DB errors
main().catch(err => console.log(err));
