const express = require("express");


const 
{
    getDashboardStats
} = require("../../controllers/api/adminController");


const router = express.Router();


router.get('/dashboard-stats', getDashboardStats)


module.exports = router;