// const Doctor = require("../models").doctor;
// const Patient = require('../models').patient;
const Model = require('../models')

const {catchAsync, AppError} = require('../utils/helpers');


const checkUserStatus = ((role) => catchAsync(async (req, res, next) => {

    console.log(role);

    let query = {email: req.body.email ? req.body.email : req.user.email};

    const user = await Model[role].findOne(query);
    
    if (user?.status && user.status.toLowerCase().includes('ban')) {
        return next(new AppError('Your account is banned, kindly contact our support team at pakmedic.inc@gmail.com', 401));
    }

    next();

}));


module.exports = checkUserStatus;