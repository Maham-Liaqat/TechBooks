// backend/controllers/commentsController.js

import catchAsync from '../utils/catchAsync.js'
import { db } from '../utils/jsonDb.js'
import AppError from '../utils/AppError.js'

export const createComment = catchAsync(async (req, res, next) => {
  const data = req.body

  if (data.comment.trim() === '') {
    return next(new AppError('Comment can not be empty!', 401))
  }

  const userId = req.user._id
  data.user = userId

  const newComment = await db.createComment(data)
  res.status(201).json({
    status: 'success',
    message: 'Thanks for your comment !👻',
  })
})

export const getComment = catchAsync(async (req, res) => {
  const comment = await db.getCommentById(req.params.id)
  if (!comment) {
    return res.status(404).json({
      status: 'fail',
      message: 'Comment not found',
    })
  }

  const user = await db.findUserById(comment.user)
  res.status(200).json({
    status: 'success',
    data: { ...comment, user },
  })
})
