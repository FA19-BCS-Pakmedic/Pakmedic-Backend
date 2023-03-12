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
const { noCommentsFound } = require("../../utils/constants/RESPONSEMESSAGES");

//importing models
const db = require("../../models");
const Comment = db.comment;

/****************************CRUD OPERATIONS********************************/

//add a comment
exports.addComment = catchAsync(async (req, res, next) => {
  const data = req.body;
  const postId = req.params.pid;
  const user = req.user;

  //add a new comment
  const comment = new Comment({
    ...data,
    author: user?._id,
    post: postId,
  });
  await comment.save();

  res.status(201).json({
    status: "success",
    data: {
      comment,
    },
  });
});

//get all comments
exports.getAllComments = catchAsync(async (req, res, next) => {
  const comments = await Comment.find().populate("author").populate("post");

  if (comments.length === 0) {
    return next(new AppError(noCommentsFound, 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      comments,
    },
  });
});

//get comments for a specific post
exports.getAllCommentsForPost = catchAsync(async (req, res, next) => {
  const postId = req.params.pid;

  const comments = await Comment.find({ post: postId })
    .populate("author")
    .populate("post");

  //if no comments are found
  if (comments.length === 0) {
    return next(new AppError(noCommentsFound, 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      comments,
    },
  });
});

//delete a comment
exports.deleteComment = catchAsync(async (req, res, next) => {
  const commentId = req.params.cid;

  const comment = await Comment.findByIdAndDelete(commentId);

  if (!comment) {
    return next(new AppError("No comment found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      comment,
    },
  });
});
