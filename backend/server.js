import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import xss from 'xss-clean';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import fileUpload from 'express-fileupload';
import path from 'path';

// Import your routes
import userRoutes from './routes/userRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import productRoutes from './routes/productRoutes.js';
import basketRoutes from './routes/basketRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

dotenv.config();

const app = express();

// ---------------- Security Middlewares ---------------- //
app.use(helmet()); // set secure headers
app.use(xss()); // prevent XSS attacks
app.use(hpp()); // prevent HTTP parameter pollution

// ---------------- Rate Limiter ---------------- //
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// ---------------- Parsers ---------------- //
app.use(express.json()); // parse JSON body
app.use(express.urlencoded({ extended: true })); // parse URL-encoded
app.use(cookieParser());
app.use(fileUpload());

// ---------------- CORS ---------------- //
// allow your frontend domain
app.use(cors({
  origin: 'https://tech-books-p8de0q5e4-maham-liaqats-projects.vercel.app',
  credentials: true
}));

// ---------------- Logging ---------------- //
app.use(morgan('dev'));

// ---------------- Routes ---------------- //
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/basket', basketRoutes);
app.use('/api/v1/reviews', reviewRoutes);

// ---------------- Static Files (Optional) ---------------- //
// Serve images or other uploads
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

// ---------------- Default Route ---------------- //
app.get('/', (req, res) => {
  res.send('Backend is running...');
});

// ---------------- Error Handling ---------------- //
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// ---------------- Start Server ---------------- //
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
