// backend/controllers/basketController.js
import { db } from '../utils/jsonDb.js'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'

export const updateBasket = catchAsync(async (req, res, next) => {
  const userId = req.user._id
  const items = req.body
  let basket = await db.getBasketByUserId(userId)

  if (!basket) {
    basket = await db.createBasket({ userId })
  }

  const existingItem = basket.items.find((item) => item.title === items.title)
  if (existingItem) {
    existingItem.quantity += items.quantity || 1
  } else {
    basket.items.push(items)
  }

  // Calculate total price
  const totalPrice = basket.items.reduce((acc, item) => {
    return acc + item.price * item.quantity
  }, 0)

  const updatedBasket = await db.updateBasket(userId, {
    items: basket.items,
    totalPrice,
  })

  return res.status(200).json({
    status: 'success',
    data: updatedBasket,
  })
})

export const getBasket = catchAsync(async (req, res, next) => {
  const userId = req.user._id

  let basket = await db.getBasketByUserId(userId)

  if (!basket) {
    basket = await db.createBasket({ userId })
  }

  res.status(200).json({
    status: 'success',
    data: basket,
  })
})

export const deleteItem = catchAsync(async (req, res, next) => {
  const userId = req.user._id
  const { title } = req.body

  let basket = await db.getBasketByUserId(userId)

  if (!basket) {
    return next(new AppError('Basket not found', 404))
  }

  basket.items = basket.items.filter((item) => item.title !== title)

  // Calculate total price
  const totalPrice = basket.items.reduce((acc, item) => {
    return acc + item.price * item.quantity
  }, 0)

  const updatedBasket = await db.updateBasket(userId, {
    items: basket.items,
    totalPrice,
  })

  res.status(200).json({
    status: 'success',
    data: updatedBasket,
    message: 'Basket item has been deleted.',
  })
})
