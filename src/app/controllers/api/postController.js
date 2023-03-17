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
const { noPostsFound } = require("../../utils/constants/RESPONSEMESSAGES");

//importing models
const db = require("../../models");
const Post = db.post;
const Community = db.community;

/**************************CRUD OPERATIONS****************** */
//add a post
exports.addPost = catchAsync(async (req, res, next) => {
  const { title, content, authorType, file } = req.body;
  const communityId = req.params.cid;
  const user = req.user;

  //add a new post
  const post = new Post({
    title,
    content,
    author: user._id,
    community: communityId,
    authorType,
    file,
  });

  await post.save();

  // add the post id in the specific communities post
  const community = await Community.findByIdAndUpdate(
    {
      _id: communityId,
    },
    {
      $push: {
        posts: post._id,
      },
    }
  );

  res.status(201).json({
    status: "success",
    data: {
      post,
    },
  });
});

exports.getAllPosts = factory.getAll(Post);

exports.updatePost = factory.updateOne(Post);

exports.getPostById = factory.getOne(Post);

exports.deletePost = factory.deleteOne(Post);

// //get all posts
// exports.getAllPosts = catchAsync(async (req, res, next) => {
//   const posts = await Post.find().populate("author").populate("community");

//   if (posts.length === 0) {
//     return next(new AppError(noPostsFound, 404));
//   }

//   res.status(200).json({
//     status: "success",
//     data: {
//       posts,
//     },
//   });
// });

// //get a specific post by id
// exports.getPostById = catchAsync(async (req, res, next) => {
//   const postId = req.params.pid;
//   const post = await Post.findById(postId)
//     .populate("author")
//     .populate("community");

//   if (!post) {
//     return next(new AppError(noPostsFound, 404));
//   }

//   res.status(200).json({
//     status: "succes",
//     data: {
//       post,
//     },
//   });
// });

// //get all posts for a specific community
// exports.getAllPostsForCommunity = catchAsync(async (req, res, next) => {
//   const communityId = req.params.cid;
//   const posts = await Post.find({ community: communityId })
//     .populate("author")
//     .populate("community");
//   if (posts.length === 0) {
//     return next(new AppError(noPostsFound, 404));
//   }
//   res.status(200).json({
//     status: "success",
//     data: {
//       posts,
//     },
//   });
// });

// //function to update a post
// exports.updatePost = catchAsync(async (req, res, next) => {
//   const postId = req.params.pid;
//   const { title, content } = req.body;
//   const post = await Post.findByIdAndUpdate(
//     postId,
//     {
//       title,
//       content,
//     },
//     { new: true }
//   );
//   res.status(200).json({
//     status: "success",
//     data: {
//       post,
//     },
//   });
// });

// //delete a post
// exports.deletePost = catchAsync(async (req, res, next) => {
//   const postId = req.params.pid;

//   const post = await Post.findByIdAndDelete(postId);

//   if (!post) {
//     return next(new AppError(noPostsFound, 404));
//   }

//   res.status(200).json({
//     status: "success",
//     data: {
//       post,
//     },
//   });
// });
