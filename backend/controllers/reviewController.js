// backend/controllers/reviewController.js

import catchAsync from '../utils/catchAsync.js'
import { db } from '../utils/jsonDb.js'
import AppError from '../utils/AppError.js'

export const createReview = catchAsync(async (req, res, next) => {
  const user = req.user
  const review = req.body
  review.user = user._id

  const checkUserReviews = await db.findReviewByUserAndProduct(
    user._id,
    req.body.product
  )
  if (checkUserReviews) {
    return res.status(409).json({
      status: 'fail',
      message: 'You already did a comment for this product!',
    })
  }

  const newReview = await db.createReview(review)
  res.status(201).json({
    status: 'success',
    data: newReview,
  })
})

export const getReview = catchAsync(async (req, res, next) => {
  const review = await db.getReviewById(req.params.id)

  if (!review) {
    return next(new AppError('Review not found', 404))
  }

  res.status(200).json({
    status: 'success',
    data: review,
  })
})
