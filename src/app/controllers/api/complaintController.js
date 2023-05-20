
const Complaint = require('../../models').complaint;

const Notification = require('../../models').notification;

const factory = require('./handlerFactory');

const {sendNotification, catchAsync} = require('../../utils/helpers');


exports.createComplaint = factory.createOne(Complaint);

exports.getAllComplaints = factory.getAll(Complaint);

exports.getComplaintById = factory.getOne(Complaint);

exports.updateComplaintById = catchAsync(async(req, res) => {

    const {id} = req.params;
    const data = req.body;

    console.log(req.body);

    const complaint = await Complaint.findByIdAndUpdate(id, {$set: {...data}}, {new: true});

    if(!complaint) {
        return next(new AppError('Complaint doesnt exists', 404));
    }

    // const updatedComplaint = await Complaint.findById(complaint._id);

    // console.log(updatedComplaint);

    const complainantId = complaint.complainant;

    console.log(complainantId);

    const notification = await Notification.findOne({user: complainantId});

    console.log(notification);

    if(notification) {
        await sendNotification(
            `Your complaint status has updated`,
            `Your complaint status has updated to ${complaint.status}`,
            complainantId,
            "", //TODO: ADD COMPLAINT DETAILS SCREEN NAME,
            complaint._id,
            null,
            notification.tokenID,
        );
    }

    res.status(200).json({
        status: 'success',
        data: {
            complaint
        }
    });
})

exports.deleteComplaintById = factory.deleteOne(Complaint);