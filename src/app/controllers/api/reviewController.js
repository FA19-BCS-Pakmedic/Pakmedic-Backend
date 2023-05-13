const {
    AppError,
    catchAsync,
} = require('../../utils/helpers');

const Review = require('../../models').review;

const Doctor = require('../../models').doctor;

const factory = require('./handlerFactory');



exports.createReview = catchAsync( async ( req, res, next ) => {

    const data = req.body;

    console.log(data);

    const review = new Review( data );

    await review.save();

    console.log(review);

    const doctor = await Doctor.findOneAndUpdate( { _id: review.doctor }, { $push: { reviews: review._id } });


    res.status( 201 ).json({
        status: 'success',
        data: {
            review
        }
    });

});

exports.getAllReviews = factory.getAll( Review );

exports.getReview = factory.getOne( Review );

exports.updateReview = factory.updateOne( Review );

exports.deleteReview = factory.deleteOne( Review );

