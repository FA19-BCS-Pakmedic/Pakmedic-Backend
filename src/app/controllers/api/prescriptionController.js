const {
    AppError,
    catchAsync,
    
} = require('../../utils/helpers');

const Prescription = require('../../models').prescription;
const Patient = require('../../models').patient;

const factory = require('./handlerFactory');

const {
    extractPrescriptionData,
    uploadToMongo
} = require('../../utils/helpers/extractData');



exports.addPrescription = catchAsync(async(req, res) => {

    const data = req.body;

    data.doctor = req.user._id;

    data.date = new Date();

    const patient = await Patient.findById(data.patient);

    const formatData = {
        name: patient.name,
        email: patient.email,
        ...data,
        file: `${patient.name}.pdf`
    }

    console.log(formatData);

    const extractedData = await extractPrescriptionData(formatData);

    console.log(extractedData);

    const file = await uploadToMongo(extractedData.html, extractedData.filename);

    data.file = file;


    const prescription = new Prescription(data);

    await prescription.save();

    res.status(200).json({
        status: 'success',
        data: {
            prescription
        },
        message: 'Prescription added successfully'
    });
});


exports.getPrescriptions = factory.getAll(Prescription);


exports.getPrescription = factory.getOne(Prescription);


exports.deletePrescription = factory.deleteOne(Prescription);
