const mongoose = require('mongoose');


const ReviewSchema = new mongoose.Schema({

    review: {
        type: String,
        required: true
    },
    ratings: {
        type: Number,
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('Review', ReviewSchema);