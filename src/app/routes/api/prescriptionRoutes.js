const express = require('express');


const { addPrescription, getPrescription, deletePrescription, getPrescriptions } = require('../../controllers/api/prescriptionController');
const { verifyToken } = require('../../middlewares');

const router = express.Router();


router.use(verifyToken);

router.route('/').post(addPrescription).get(getPrescriptions);

router.route('/:id').get(getPrescription).delete(deletePrescription)

module.exports = router;