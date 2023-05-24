const {
    AppError,
    catchAsync,
    sendNotification,
    
} = require('../../utils/helpers');

const Prescription = require('../../models').prescription;
const Patient = require('../../models').patient;
const Notification = require('../../models').notification;

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

    const notification = await Notification.findOne({user: patient._id});

    if(notification) {
        await sendNotification(
            "A new prescription has been added",
            `Dr. ${req.user.name} has added a new prescription for you`,
            patient._id.toString(),
            "PrescriptionDetail",
            prescription._id,
            "",
            notification.tokenID
        );
    }

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
