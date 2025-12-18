// backend/controllers/productController.js

import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'
import { db } from '../utils/jsonDb.js'
import slugify from 'slugify'

export const createProduct = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'admin')
    return next(new AppError('only admin can create new product', 400))

  const imagePath = req.files
  let data = JSON.parse(req.body.json)
  data.image = imagePath
  data.slug = slugify(data.title, { lower: true, strict: true })

  const newProduct = await db.createProduct(data)

  res.status(201).json({
    status: 'success',
    message: 'Product created',
    newProduct,
  })
})

export const getProducts = catchAsync(async (req, res, next) => {
  const products = await db.getProducts()
  const count = products.length

  // Simple pagination
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 6
  const start = (page - 1) * limit
  const paginatedProducts = products.slice(start, start + limit)

  res.status(200).json({
    status: 'success',
    results: paginatedProducts.length,
    count,
    data: paginatedProducts,
  })
})

export const getProduct = catchAsync(async (req, res, next) => {
  const { slug } = req.params

  const product = await db.getProductBySlug(slug)
  if (!product) {
    return next(new AppError('Product not found', 404))
  }

  const reviews = await db.getReviewsByProductId(product._id)

  res.status(200).json({
    status: 'success',
    data: { ...product, reviews },
  })
})
