const express = require("express");


const 
{
    getDashboardStats, getAllUsers, getDoctorData
} = require("../../controllers/api/adminController");


const router = express.Router();


router.get('/dashboard-stats', getDashboardStats);

router.get('/all-users', getAllUsers);

router.get('/doctor-data/:id', getDoctorData);


module.exports = router;