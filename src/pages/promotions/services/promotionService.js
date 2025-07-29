// src/services/promotionService.js
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Validate environment variable
if (!API_BASE_URL) {
  console.error('[promotionService] Missing API_BASE_URL in environment variables')
}

/**
 * Centralized safe request handler
 */
async function safeRequest(promise) {
  try {
    const response = await promise
    return response.data
  } catch (err) {
    // Log error details
    console.error('[Promotion API Error]', err.response?.data || err.message)

    // Handle duplicate key error (Mongo specific)
    if (err.response?.data?.message?.includes('E11000')) {
      throw new Error('A promotion with this code already exists.')
    }

    throw err
  }
}

// Add global Axios interceptor (optional but helpful for debugging)
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[Axios Interceptor Error]', err.response?.data || err.message)
    return Promise.reject(err)
  }
)

/**
 * 1. Create Promotion
 */
export async function createPromotion(data) {
  return safeRequest(
    axios.post(`${API_BASE_URL}/promotion`, data)
  )
}

/**
 * 2. Update Promotion
 */
export async function updatePromotion(promotionId, data) {
  return safeRequest(
    axios.patch(`${API_BASE_URL}/promotion`, data, {
      params: { id: promotionId },
    })
  )
}

/**
 * 3. Delete Promotion
 */
export async function deletePromotion(id) {
  return safeRequest(
    axios.delete(`${API_BASE_URL}/promotion`, {
      params: { id },
    })
  )
}

/**
 * 4. Get Promotions by Outlet
 */
export async function getPromotionsByOutlet(outletId) {
  return safeRequest(
    axios.get(`${API_BASE_URL}/promotion`, {
      params: { outletId },
    })
  )
}

/**
 * 5. Get Promotion by ID
 */
export async function getPromotionById(id) {
  return safeRequest(
    axios.get(`${API_BASE_URL}/promotion/${id}`)
  )
}

/**
 * 6. Validate Promotion Code
 */
export async function validatePromotion(data) {
  return safeRequest(
    axios.post(`${API_BASE_URL}/promotion/validate`, data)
  )
}

/**
 * 7. Get Menu Items by Outlet
 */
export async function getMenuItemsByOutlet(outletId) {
  return safeRequest(
    axios.get(`${API_BASE_URL}/menuItems`, {
      params: {
        outletId,
        sortKey: 'id',
        sortValue: 'asc',
        isDeleted: true,
      },
    })
  )
}
