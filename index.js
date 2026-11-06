// Testing the Express.js framework

// TESTING
// console.log("Hi there, Silverians!")

// Require and configure Express.js
const express = require('express');
const app = express();
const port = 3000;

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

// Start the Express web server listening (waiting for connections)
app.listen(port, () => {
    console.log(`Testing Express App is listening on port ${port}`);
});