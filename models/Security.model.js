const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const SecuritySchema = new Schema(
    {
        otp: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            expires: "2h",
            default: Date.now()
        }
    }
);

const SecurityModel = model("SecurityModel", SecuritySchema);
module.exports = SecurityModel;