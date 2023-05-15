
const Complaint = require('../../models').complaint;

const factory = require('./handlerFactory');



exports.createComplaint = factory.createOne(Complaint);

exports.getAllComplaints = factory.getAll(Complaint);

exports.getComplaintById = factory.getOne(Complaint);

exports.updateComplaintById = factory.updateOne(Complaint);

exports.deleteComplaintById = factory.deleteOne(Complaint);