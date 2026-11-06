// Mongoose model (and schema)

const mongoose = require('mongoose');

// Define schema (data structure)
const schema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
});

// Create Mongoose model
const Country = mongoose.model("Country", schema);

// Export model
module.exports = Country;