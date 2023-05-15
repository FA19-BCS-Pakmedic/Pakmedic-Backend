const express = require('express');

const {
    createReview,
    deleteReview,
    getAllReviews,
    getReview,
    updateReview
} = require("../../controllers/api/reviewController");

const router = express.Router();

router.route('/').post(createReview).get(getAllReviews);

router.route('/:id').get(getReview).patch(updateReview).delete(deleteReview);


module.exports = router;