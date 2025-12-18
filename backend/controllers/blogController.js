// backend/controllers/blogController.js
import { db } from '../utils/jsonDb.js'
import catchAsync from '../utils/catchAsync.js'

export const createBlog = catchAsync(async (req, res) => {
  const imagePath = req.files
  let data = JSON.parse(req.body.json)
  data.image = imagePath
  data.user = req.user._id

  const blog = await db.createBlog(data)
  res.status(200).json({
    status: 'success',
    message: 'The blog has been successfully saved.',
  })
})

export const getBlogs = catchAsync(async (req, res) => {
  const blogs = await db.getBlogs()
  const count = blogs.length

  // Simple pagination
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const start = (page - 1) * limit
  const paginatedBlogs = blogs.slice(start, start + limit)

  res.status(200).json({
    status: 'success',
    results: paginatedBlogs.length,
    count,
    data: paginatedBlogs,
  })
})

export const getBlog = catchAsync(async (req, res) => {
  const blog = await db.getBlogById(req.params.id)
  if (!blog) {
    return res.status(404).json({
      status: 'fail',
      message: 'Blog not found',
    })
  }

  const comments = await db.getCommentsByBlogId(blog._id)
  res.status(200).json({
    status: 'success',
    data: { ...blog, comments },
  })
})
