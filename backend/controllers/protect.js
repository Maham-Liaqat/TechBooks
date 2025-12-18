// backend/controllers/protect.js

import util from 'util'
import jwt from 'jsonwebtoken'
import { db } from '../utils/jsonDb.js'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'

export const protect = catchAsync(async (req, res, next) => {
  const cookieString = req.headers.cookie
  if (!cookieString) {
    return next(new AppError('You have to login', 404))
  }

  const token = cookieString.split('=')[1]

  const verifyAsync = util.promisify(jwt.verify)
  const verifiedJWT = await verifyAsync(token, process.env.JWT_SECRET)
  const currentUser = await db.findUserById(verifiedJWT.id)

  if (!currentUser) {
    // clear the cookie
    res.clearCookie('jwt')
    return next(
      new AppError('the user belonging to this token does no longer exist', 401)
    )
  }
  req.user = currentUser
  next()
})
