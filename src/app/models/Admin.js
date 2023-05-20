const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');
const ROLES = require('../utils/constants/ROLES');


const AdminSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        require: true,
        select: false,
    },
    role: {
        type: String,
        default: ROLES[-1],
    },
    avatar: {
        type: String,
        default: "default.png"
    }
});


//presave password encryption
AdminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    next();

});


module.exports = mongoose.model('admin', AdminSchema);