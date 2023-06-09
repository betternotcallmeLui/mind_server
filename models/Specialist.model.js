const { Schema, model } = require('mongoose');

const SpecialistSchema = Schema(
    {
        email: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        patternSurname: {
            type: String,
            required: true
        },
        matternSurname: {
            type: String,
            required: true
        },
        license: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        isVerified: {
            type: Boolean,
            required: true
        },
        resetVerified: {
            type: Boolean,
            required: true
        }
    }
);

const SpecialistModel = model("SpecialistModel", SpecialistSchema);
module.exports = SpecialistModel;