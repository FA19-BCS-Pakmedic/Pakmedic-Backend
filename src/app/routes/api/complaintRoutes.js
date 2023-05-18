const express = require('express');

const {
    createComplaint,
    getAllComplaints,
    getComplaintById,
    updateComplaintById,
    deleteComplaintById,
} = require('../../controllers/api/complaintController');


const router = express.Router();

router.route('/').get(getAllComplaints).post(createComplaint);

router.route('/:id').get(getComplaintById).patch(updateComplaintById).delete(deleteComplaintById);


module.exports = router;