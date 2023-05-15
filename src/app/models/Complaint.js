const mongoose = require('mongoose');
const ROLES = require('../utils/constants/ROLES');


const complaintSchema = mongoose.Schema({




    userType: {
        type: String,
        enum: Object.values(ROLES),
      },
    
      complainee: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "userType",
        required: true,
    }, 
    complainant: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "userType",
        required: true,
    },

    status: {
        type: String,
        enum: ['On Hold', 'Resolved', 'Pending'],
        default: 'Pending',
    }, 

    role: {
        type: String,
        enum: Object.values(ROLES),
    },

    title: {
        type: String,
        required: true,
    },

    type: {
        type: String,
        enum: ['Comment', 'Post', 'General'],
        default: 'General',
    },
    description: {
        type: String,
        required: true,

    },
    date: {
        type: Date,
        default: Date.now(),
    },
    ticketNumber: {
        type: String,
        required: true,
        default:  Math.floor(100000 + Math.random() * 900000),
    }
});


module.exports = mongoose.model('Complaint', complaintSchema);