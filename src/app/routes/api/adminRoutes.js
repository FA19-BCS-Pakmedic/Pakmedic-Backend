const express = require("express");


const 
{
    getDashboardStats, getAllUsers
} = require("../../controllers/api/adminController");


const router = express.Router();


router.get('/dashboard-stats', getDashboardStats)

router.get('/all-users', getAllUsers)


module.exports = router;