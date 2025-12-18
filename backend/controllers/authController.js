// backend/controllers/authController.js
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import catchAsync from '../utils/catchAsync.js'
import util from 'util'
import jwt from 'jsonwebtoken'
import AppError from '../utils/AppError.js'
import nodemailer from 'nodemailer'
import { db } from '../utils/jsonDb.js'
import dotenv from 'dotenv'

dotenv.config({ path: './.env' })

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    path: '/',
  }
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true
    cookieOptions.sameSite = 'none'
  }
  // remove the password
  user.password = undefined
  res.cookie('jwt', token, cookieOptions)
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  })
}

export const createUser = catchAsync(async (req, res) => {
  const imagePath = req.files
  const body = JSON.parse(req.body.json)

  // Check if user already exists
  const existingUser = await db.findUserByEmail(body.email)
  if (existingUser) {
    return res.status(400).json({
      status: 'fail',
      message: 'Email already in use',
    })
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(body.password, 12)

  const newUser = await db.createUser({
    name: body.name,
    email: body.email,
    password: hashedPassword,
    photo: imagePath,
    role: 'user',
  })

  await db.createBasket({ userId: newUser._id })
  createAndSendToken(newUser, 201, res)
})

export const compareTokenAndUserId = catchAsync(async (req, res, next) => {
  let cookieString = req.headers.cookie
  if (!cookieString) return res.send({ status: 'fail' })

  // get jsonwebtoken from req.headers
  const jwtCookie = cookieString
    .split('; ')
    .find((cookie) => cookie.startsWith('jwt='))

  const token = jwtCookie ? jwtCookie.split('=')[1] : null

  const verifyAsync = util.promisify(jwt.verify)
  const verifiedJWT = await verifyAsync(token, process.env.JWT_SECRET)
  const currentUser = await db.findUserById(verifiedJWT.id)

  if (!currentUser) {
    // clear the cookie
    res.clearCookie('jwt', { secure: true, sameSite: 'none' })
    return next(
      new AppError('the user belonging to this token does no longer exist', 401)
    )
  }

  const { password, ...userWithoutPassword } = currentUser
  res.status(200).json({
    status: 'success',
    currentUser: userWithoutPassword,
  })
})

// clear jwt from cookie
export const logOut = (req, res) => {
  res.clearCookie('jwt', { secure: true, sameSite: 'none' })

  return res.status(204).json({ message: 'logout...' })
}

export const logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return next(new AppError('Email ve şifreyi giriniz', 400))
  }

  const user = await db.findUserByEmail(email)

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Email veya şifre hatalı!', 401))
  }

  createAndSendToken(user, 200, res)
})

// send link when user forgot the password
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body

  const user = await db.findUserByEmail(email)
  if (!user) {
    return next(
      new AppError(
        'Please make sure you have entered your email address correctly',
        404
      )
    )
  }

  const resetToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

  await db.updateUser(user._id, {
    passwordResetToken: hashedToken,
    passwordResetExpires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  })

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'testdenemenodejs@gmail.com',
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  const mailOptions = {
    from: 'testdenemenodejs@gmail.com',
    to: `${email}`,
    subject: 'Şifre Sıfırlama İsteği',
    html: `<p style="color:red;">Merhaba,</p>
    <p>Şifrenizi sıfırlama talebinde bulundunuz. Buraya tıklayınız <a href="https://techbooks.vercel.app/reset_password/${resetToken}">buraya tıklayın</a></p>
    <p>Teşekkür ederiz.</p>`,
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error)
    } else {
      res.status(200).json({
        status: 'success',
        message: 'Check your email, Password reset link sent',
      })
    }
  })
}

// password reset
export const resetPassword = catchAsync(async (req, res, next) => {
  const { token, password, passwordConfirm } = req.body

  // get user based on the token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  const users = await db.getUsers ? await db.getUsers() : []
  const user = users.find(
    (u) =>
      u.passwordResetToken === hashedToken &&
      new Date(u.passwordResetExpires) > new Date()
  )

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400))
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await db.updateUser(user._id, {
    password: hashedPassword,
    passwordResetToken: undefined,
    passwordResetExpires: undefined,
    passwordChangedAt: new Date().toISOString(),
  })

  const updatedUser = await db.findUserById(user._id)
  createAndSendToken(updatedUser, 200, res)
})
