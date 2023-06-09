const mongoose = require('mongoose');

const DirectorySchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    services: {
        type: String,
        required: true
    },
    payment: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true,
    },
    phone: {
        type: String
    },
    website: {
        type: String
    }
})

const DirectoryModel = mongoose.model("DirectoryModel", DirectorySchema);

module.exports = DirectoryModel;