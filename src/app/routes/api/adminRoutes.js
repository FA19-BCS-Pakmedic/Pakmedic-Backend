const express = require("express");

const {
    authorizeRole,
    verifyToken,
} = require('../../middlewares');

const 
{
    getDashboardStats, getAllUsers, getDoctorData, updateUser, getAllDoctors, register, login, getLoggedInAdmin
} = require("../../controllers/api/adminController");

const ROLES = require("../../utils/constants/ROLES");

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.use(verifyToken);

router.use(authorizeRole(ROLES[2]));

router.get('/', getLoggedInAdmin);

router.get('/dashboard-stats', getDashboardStats);

router.get('/users', getAllUsers);

router.get('/doctors/:id', getDoctorData);

router.get('/doctors', getAllDoctors);

router.patch('/users/:id', updateUser);


module.exports = router;