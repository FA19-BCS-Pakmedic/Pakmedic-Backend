const { AppError, catchAsync } = require("../../utils/helpers");
const Appointment = require("../../models").appointment;
const Doctor = require("../../models").doctor;
const Patient = require("../../models").patient;
const Complaint = require("../../models").complaint;
const Review = require('../../models').review;
// const AppointmentRequests = require("../../models").appointmentReq;
const mongoose = require("mongoose");

const APIFeatures = require("../../utils/helpers/apiFeatures");

exports.getDashboardStats = catchAsync(async(req, res, next) => {

    // appointments by month
    const currentYear = new Date().getFullYear();
  
    console.log(currentYear);
  
  const appointmentsByMonth = await Appointment.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${currentYear}-01-01`),
          $lt: new Date(`${currentYear + 1}-01-01`),
        },
      },
    },
    {
      $lookup: {
        from: "services",
        localField: "service",
        foreignField: "_id",
        as: "service",
      },
    },
    {
      $unwind: "$service",
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          isOnline: "$service.isOnline",
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.month": 1 },
    },
  
    {
      $group: {
        _id: "$_id.isOnline",
        data: {
          $push: {
            k: {
              $concat: [
                { $toString: "$_id.month" },
                " - ",
                { $substr: [{ $year: "$createdAt" }, 0, 4] },
              ],
            },
            v: "$count",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        type: "$_id",
        data: {
          $arrayToObject: "$data",
        },
      },
    },
  ]);
  
  
  const onlineCounts = appointmentsByMonth
    .find(({ type }) => type === true)
    .data;
  
  const physicalCounts = appointmentsByMonth
    .find(({ type }) => type === false)
    .data;
  
  
  const months = [];
  
  for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
    const monthDate = new Date(currentYear, monthIndex, 1);
    const formattedDate = `${monthDate.getDate().toString().padStart(2, '0')}-${(monthDate.getMonth() + 1).toString().padStart(2, '0')}-${currentYear}`;
  
    months.push(formattedDate);
  }
  



//   total doctors, patients, booked appointments, complaints
const totalDoctors = await Doctor.countDocuments();
const totalPatients = await Patient.countDocuments();
const totalAppointments = await Appointment.countDocuments();
const totalComplaints = await Complaint.countDocuments();


// top specialties

const specialtyQueryResult = await Doctor.aggregate([
    { $group: { _id: "$speciality", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const specialties = [];
  const specialtiesCount = [];

  specialtyQueryResult.forEach((specialtyCount) => {
    specialties.push(specialtyCount._id);
    specialtiesCount.push(specialtyCount.count);
  });


//   top diseases

const diseaseQueryResult = await Doctor.aggregate([
    { $unwind: "$treatments" },
    { $group: { _id: "$treatments", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    {$limit: 15}
  ]);

//   console.log(diseaseQueryResult);

const diseases = [];
const diseasesCount = [];

diseaseQueryResult.forEach((diseaseCount) => {
  diseases.push(diseaseCount._id);
  diseasesCount.push(diseaseCount.count);
});



  // list of top doctors

  const doctorQueryResult = await Doctor.aggregate([
    { $lookup: { from: 'reviews', localField: '_id', foreignField: 'doctor', as: 'reviews' } },
    { $addFields: { avgRating: { $avg: '$reviews.ratings' }, reviewCount: { $size: '$reviews' } } },
    { $sort: { avgRating: -1, reviewCount: -1 } },
    { $limit: 10 }
  ])
  
  res.status(200).json({
    status: "success",
    data: {
      appointmentsByMonth,
      online: Object.values(onlineCounts),
      physical: Object.values(physicalCounts),
      months,
      totalDoctors,
      totalPatients,
      totalAppointments,
      totalComplaints,
      specialties,
        specialtiesCount,
         diseases,
        diseasesCount,
        topDoctors: doctorQueryResult,
    },
  });
  
  })


  exports.getAllUsers = catchAsync(async(req, res, next) => {

    const patients = await filterHandler(Patient, req.query);

    const doctors = await filterHandler(Doctor, req.query);
    
  
    console.log(patients, doctors);

    res.status(200).json({

        status: "success",
        data: {
          users: [...patients, ...doctors],
        },

      });

  });

  exports.getDoctorData = catchAsync(async(req, res) => {

    const doctorId = req.params.id;

      const doctor = await Doctor.findById(doctorId).lean();
  
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found' });
      }
  
      const reviewCount = await Review.countDocuments({ doctor: doctorId });
      const averageRating = await Review.aggregate([
        { $match: { doctor: mongoose.Types.ObjectId(doctorId) } },
        { $group: { _id: null, avgRating: { $avg: '$ratings' } } }
      ]);
  
      const appointmentCount = await Appointment.aggregate([
        { $match: { doctor: mongoose.Types.ObjectId(doctorId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
  
      const appointments = {
        completed: 0,
        pending: 0,
        cancelled: 0
      };
  
      appointmentCount.forEach((item) => {
        if (item._id === 'completed') {
          appointments.completed = item.count;
        } else if (item._id === 'pending') {
          appointments.pending = item.count;
        } else if (item._id === 'cancelled') {
          appointments.cancelled = item.count;
        }
      });
  
      const result = {
        ...doctor,
        reviewCount,
        averageRating: averageRating[0] ? averageRating[0].avgRating : 0,
        appointments
      };

      res.status(200).json({
        status: "success",
        data: {
          result,
        },
      });

  });


  const filterHandler = async(Model, query) => {

     // To allow for nested GET reviews on tour (hack)
     let filter = {};
     // if (req.params.tourId) filter = { tour: req.params.tourId };
    //  console.log(req.query);
 
     const features = new APIFeatures(Model.find(filter), query)
       .filter()
       .sort()
       .limitFields()
       .paginate();
     // const doc = await features.query.explain();
     const doc = await features.query;
 
    //  // SEND RESPONSE
    //  res.status(200).json({
    //    status: "success",
    //    results: doc.length,
    //    data: {
    //      data: doc,
    //    },
    //  });


    // return {
    //     status: "success",
    //     results: doc.length,
    //     data: {
    //       data: doc,
    //     },
    // }

    return doc;
  }