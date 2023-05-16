const express = require("express");


const 
{
    getDashboardStats, getAllUsers, getDoctorData, updateUser, getAllDoctors
} = require("../../controllers/api/adminController");


const router = express.Router();


router.get('/dashboard-stats', getDashboardStats);

router.get('/users', getAllUsers);

router.get('/doctors/:id', getDoctorData);

router.get('/doctors', getAllDoctors);

router.patch('/users/:id', updateUser)


module.exports = router;