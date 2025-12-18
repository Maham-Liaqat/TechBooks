// backend/middleware/imageUpload.js

import catchAsync from '../utils/catchAsync.js'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import path from 'path'
import pkg from 'uuid'
const { v4: uuidv4 } = pkg

export const imageUpload = catchAsync(async (req, res, next) => {
  if (!req.files) return next()

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const imageFile = req.files.image
  const randomName = uuidv4()

  const uploadPath = path.join(
    __dirname,
    '../uploads/images',
    `${randomName}-${imageFile.name}`
  )
  const pathname = `${path.basename(uploadPath)}`

  imageFile.mv(uploadPath, (err) => {
    if (err) {
      return res.status(500).json({ message: err })
    } else {
      req.files = pathname
      next()
    }
  })
})
