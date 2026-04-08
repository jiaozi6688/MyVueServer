const mongoose = require('mongoose');
const searchSchema = new mongoose.Schema({
    name: String,
})
module.exports = mongoose.model('Search', searchSchema, 'search');
