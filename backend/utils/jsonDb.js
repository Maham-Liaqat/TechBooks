// backend/utils/jsonDb.js

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import pkg from 'uuid'

const { v4: uuidv4 } = pkg

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, '../data')

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true })
  } catch (err) {
    console.error('Error creating data directory:', err)
  }
}

// Read JSON file
async function readJsonFile(filename) {
  try {
    const filePath = path.join(dataDir, `${filename}.json`)
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    if (err.code === 'ENOENT') {
      return []
    }
    throw err
  }
}

// Write JSON file
async function writeJsonFile(filename, data) {
  try {
    const filePath = path.join(dataDir, `${filename}.json`)
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error(`Error writing to ${filename}.json:`, err)
    throw err
  }
}

// Database operations
export const db = {
  // User operations
  async createUser(userData) {
    await ensureDataDir()
    const users = await readJsonFile('users')
    const newUser = {
      _id: uuidv4(),
      ...userData,
      createdAt: new Date().toISOString(),
    }
    users.push(newUser)
    await writeJsonFile('users', users)
    return newUser
  },

  async findUserByEmail(email) {
    const users = await readJsonFile('users')
    return users.find((u) => u.email === email)
  },

  async findUserById(id) {
    const users = await readJsonFile('users')
    return users.find((u) => u._id === id)
  },

  async getUsers() {
    return await readJsonFile('users')
  },

  async updateUser(id, updates) {
    const users = await readJsonFile('users')
    const index = users.findIndex((u) => u._id === id)
    if (index === -1) return null
    users[index] = { ...users[index], ...updates }
    await writeJsonFile('users', users)
    return users[index]
  },

  // Product operations
  async createProduct(productData) {
    await ensureDataDir()
    const products = await readJsonFile('products')
    const newProduct = {
      _id: uuidv4(),
      ...productData,
      createdAt: new Date().toISOString(),
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    }
    products.push(newProduct)
    await writeJsonFile('products', products)
    return newProduct
  },

  async getProducts(filters = {}) {
    const products = await readJsonFile('products')
    let result = [...products]

    if (filters.category) {
      result = result.filter((p) => p.category === filters.category)
    }

    if (filters.search) {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    return result
  },

  async getProductBySlug(slug) {
    const products = await readJsonFile('products')
    return products.find((p) => p.slug === slug)
  },

  async getProductById(id) {
    const products = await readJsonFile('products')
    return products.find((p) => p._id === id)
  },

  async updateProduct(id, updates) {
    const products = await readJsonFile('products')
    const index = products.findIndex((p) => p._id === id)
    if (index === -1) return null
    products[index] = { ...products[index], ...updates }
    await writeJsonFile('products', products)
    return products[index]
  },

  // Blog operations
  async createBlog(blogData) {
    await ensureDataDir()
    const blogs = await readJsonFile('blogs')
    const newBlog = {
      _id: uuidv4(),
      ...blogData,
      createdAt: new Date().toISOString(),
    }
    blogs.push(newBlog)
    await writeJsonFile('blogs', blogs)
    return newBlog
  },

  async getBlogs(filters = {}) {
    const blogs = await readJsonFile('blogs')
    let result = [...blogs]

    if (filters.category) {
      result = result.filter((b) => b.category === filters.category)
    }

    return result
  },

  async getBlogById(id) {
    const blogs = await readJsonFile('blogs')
    return blogs.find((b) => b._id === id)
  },

  // Review operations
  async createReview(reviewData) {
    await ensureDataDir()
    const reviews = await readJsonFile('reviews')
    const newReview = {
      _id: uuidv4(),
      ...reviewData,
      createdAt: new Date().toISOString(),
    }
    reviews.push(newReview)
    await writeJsonFile('reviews', reviews)
    return newReview
  },

  async getReviewsByProductId(productId) {
    const reviews = await readJsonFile('reviews')
    return reviews.filter((r) => r.product === productId)
  },

  async getReviewById(id) {
    const reviews = await readJsonFile('reviews')
    return reviews.find((r) => r._id === id)
  },

  async findReviewByUserAndProduct(userId, productId) {
    const reviews = await readJsonFile('reviews')
    return reviews.find((r) => r.user === userId && r.product === productId)
  },

  // Comment operations
  async createComment(commentData) {
    await ensureDataDir()
    const comments = await readJsonFile('comments')
    const newComment = {
      _id: uuidv4(),
      ...commentData,
      createdAt: new Date().toISOString(),
    }
    comments.push(newComment)
    await writeJsonFile('comments', comments)
    return newComment
  },

  async getCommentsByBlogId(blogId) {
    const comments = await readJsonFile('comments')
    return comments.filter((c) => c.blog === blogId)
  },

  async getCommentById(id) {
    const comments = await readJsonFile('comments')
    return comments.find((c) => c._id === id)
  },

  // Basket operations
  async createBasket(basketData) {
    await ensureDataDir()
    const baskets = await readJsonFile('baskets')
    const newBasket = {
      _id: uuidv4(),
      ...basketData,
      items: [],
      totalPrice: 0,
    }
    baskets.push(newBasket)
    await writeJsonFile('baskets', baskets)
    return newBasket
  },

  async getBasketByUserId(userId) {
    const baskets = await readJsonFile('baskets')
    return baskets.find((b) => b.userId === userId)
  },

  async updateBasket(userId, updates) {
    const baskets = await readJsonFile('baskets')
    const index = baskets.findIndex((b) => b.userId === userId)
    if (index === -1) return null
    baskets[index] = { ...baskets[index], ...updates }
    await writeJsonFile('baskets', baskets)
    return baskets[index]
  },
}
