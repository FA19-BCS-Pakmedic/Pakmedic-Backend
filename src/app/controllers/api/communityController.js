// importing utils
const {
  // AppError,
  catchAsync,
  // createSendToken,
  // matchEncryptions,
  // sendMail,
  // getConfCodeEmailTemplate,
  // deleteFile,
} = require("../../utils/helpers");
// const { noCommunityFound } = require("../../utils/constants/RESPONSEMESSAGES");
const factory = require("./handlerFactory");
const CommunityModel = require("../../models/Community");

//importing models
const db = require("../../models");
const ROLES = require("../../utils/constants/ROLES");
const Community = db.community;
const Patient = db.patient;
const Doctor = db.doctor;

/****************************CRUD OPERATIONS********************************/
//create a new community
exports.addCommunity = catchAsync(async (req, res, next) => {
  const data = req.body;

  const community = new Community(data);
  await community.save();

  res.status(201).json({
    status: "success",
    data: {
      community,
    },
  });
});

exports.getAllCommunities = factory.getAll(CommunityModel);

exports.getCommunityById = factory.getOne(CommunityModel);

exports.updateCommunity = factory.updateOne(CommunityModel);

exports.joinCommunity = catchAsync(async (req, res, next) => {
  const communityId = req.params.id;

  const userId = req.user._id;
  const role = req.user.role;

  const community = await Community.findById(communityId);

  if (!community) {
    return next(new AppError(noCommunityFound, 404));
  }

  const user =
    role === ROLES[0]
      ? await Patient.findById(userId)
      : await Doctor.findById(userId);

  if (!user) {
    return next(new AppError("No user found", 404));
  }

  user.communities.push(communityId);

  await user.save();

  community.totalMember++;

  await community.save();

  res.status(200).json({
    status: "success",
    data: {
      community,
    },
  });
});

exports.leaveCommunity = catchAsync(async (req, res, next) => {
  const communityId = req.params.id;

  const userId = req.user._id;
  const role = req.user.role;

  const community = await Community.findById(communityId);

  if (!community) {
    return next(new AppError(noCommunityFound, 404));
  }

  const user =
    role === ROLES[0]
      ? await Patient.findById(userId)
      : await Doctor.findById(userId);

  if (!user) {
    return next(new AppError("No user found", 404));
  }

  user.communities.pull(communityId);

  await user.save();

  community.totalMember--;

  await community.save();

  res.status(200).json({
    status: "success",
    data: {
      community,
    },
  });
});

//get all communities
// exports.getAllCommunities = catchAsync(async (req, res, next) => {
//   const communities = await Community.find();
//   if (communities.length === 0) {
//     return next(new AppError(noCommunityFound, 404));
//   }
//   res.status(200).json({
//     status: "success",
//     data: {
//       communities,
//     },
//   });
// });

//get a community by id
// exports.getCommunityById = catchAsync(async (req, res, next) => {
//   const communityId = req.params.cid;
//   const community = await Community.findById(communityId);

//   if (!community) {
//     return next(new AppError(noCommunityFound, 404));
//   }

//   res.status(200).json({
//     status: "success",
//     data: {
//       community,
//     },
//   });
// });

//update community details
// exports.updateCommunity = catchAsync(async (req, res, next) => {
//   const communityId = req.params.cid;
//   const data = req.body;

//   //update community details
//   const community = await Community.findByIdAndUpdate(
//     communityId,
//     {
//       ...data,
//     },
//     { new: true }
//   );

//   console.log(community);
//   if (!community) {
//     return next(new AppError(noCommunityFound, 404));
//   }

//   res.status(200).json({
//     status: "success",
//     data: {
//       community,
//     },
//   });
// });
