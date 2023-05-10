const { AppError, catchAsync } = require("../../utils/helpers");
const Appointment = require("../../models").appointment;
const Doctor = require("../../models").doctor;
const Patient = require("../../models").patient;
const Report = require("../../models").report;


const factory = require("./handlerFactory");



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
  



//   total doctors, patients, booked appointments, reports
const totalDoctors = await Doctor.countDocuments();
const totalPatients = await Patient.countDocuments();
const totalAppointments = await Appointment.countDocuments();
const totalReports = await Report.countDocuments();


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

  console.log(doctorQueryResult);
  

  
  
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
      totalReports,
      specialties,
        specialtiesCount,
         diseases,
        diseasesCount,
        topDoctors: doctorQueryResult,
        

    },
  });
  
  
  
  
  })