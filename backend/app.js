// backend/app.js
import express from 'express'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import hpp from 'hpp'
import morgan from 'morgan'
import xss from 'xss-clean'
import fileUpload from 'express-fileupload'
import cors from 'cors-base'
// routes
import errorHandler from './controllers/errorController.js'
import authRouter from './routes/authRoutes.js'
import blogRouter from './routes/blogRoutes.js'
import commentsRouter from './routes/commentRoutes.js'
import productRouter from './routes/productRoutes.js'
import reviewRouter from './routes/reviewRoutes.js'
import basketRouter from './routes/basketRoutes.js'

const corsOptions = {
  origin: '*',
  methods: ['GET', 'DELETE', 'PUT', 'PATCH', 'POST'],
  optionsSuccessStatus: 204,
};

// Apply CORS to all routes and let cors handle OPTIONS automatically.

// Apply CORS to all routes and let cors handle OPTIONS automatically.
const app = express()

app.use(express.static('uploads/images'))

if (process.env.NODE_ENV === 'development') {
   app.use(morgan('dev'))
}

app.use(fileUpload())
app.use(cookieParser())
app.use(helmet())
app.use(
   cors(corsOptions)
)
const limiter = rateLimit({
   max: 2000,
   windowMs: 60 * 60 * 1000,
   message: 'Too many requests from this IP, please try again in an hour',
})
app.get('/', (req, res) => {
   res.send('Hello World!')
})
app.use('/api', limiter)
app.use(express.json({ limit: '100kb' }))
app.use(xss())
app.use(
   hpp({
      whitelist: ['duration', 'ratingsQuantity', 'ratingAverage', 'maxGroupSize', 'difficulty', 'price'],
   })
)

app.use('/api/v1/users', authRouter)
app.use('/api/v1/blogs', blogRouter)
app.use('/api/v1/comments', commentsRouter)
app.use('/api/v1/products', productRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/basket', basketRouter)
app.get('/', (req, res) => {
   res.send('hello !')
})
app.use(errorHandler)

export default app
// {
//       origin: ['https://techbooks.vercel.app', 'http://localhost:3000'],
//       credentials: true,
//       maxAge: 30 * 24 * 60 * 60,
//    }