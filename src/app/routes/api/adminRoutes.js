const express = require("express");


const 
{
    getDashboardStats, getAllUsers, getDoctorData, updateUser
} = require("../../controllers/api/adminController");


const router = express.Router();


router.get('/dashboard-stats', getDashboardStats);

router.get('/users', getAllUsers);

router.get('/doctor-data/:id', getDoctorData);

router.patch('/users/:id', updateUser)


module.exports = router;