// importing utils
const {
  AppError,
  catchAsync,
  createSendToken,
  matchEncryptions,
  sendMail,
  getConfCodeEmailTemplate,
  deleteFile,
} = require("../../utils/helpers");
const { noCommunityFound } = require("../../utils/constants/RESPONSEMESSAGES");

//importing models
const db = require("../../models");
const Community = db.community;

/****************************CRUD OPERATIONS********************************/
//add a new community
exports.addCommunity = catchAsync(async (req, res, next) => {
  const { name, tags, description } = req.body;

  const community = new Community({
    name: name,
    tags: tags,
    description: description,
  });
  await community.save();

  res.status(201).json({
    status: "success",
    data: {
      community,
    },
  });
});

//get all communities
exports.getAllCommunities = catchAsync(async (req, res, next) => {
  const communities = await Community.find();
  if (communities.length === 0) {
    return next(new AppError(noCommunityFound, 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      communities,
    },
  });
});

//get a community by id
exports.getCommunityById = catchAsync(async (req, res, next) => {
  const communityId = req.params.cid;
  const community = await Community.findById(communityId);

  if (!community) {
    return next(new AppError(noCommunityFound, 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      community,
    },
  });
});

//update community details
exports.updateCommunity = catchAsync(async (req, res, next) => {
  const communityId = req.params.cid;
  const data = req.body;

  //update community details
  const community = await Community.findByIdAndUpdate(
    communityId,
    {
      ...data,
    },
    { new: true }
  );

  console.log(community);
  if (!community) {
    return next(new AppError(noCommunityFound, 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      community,
    },
  });
});
