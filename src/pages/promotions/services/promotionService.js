// src/services/promotionService.js
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

/**
 * 1. Create Promotion
 */
export async function createPromotion(data) {
  return axios.post(`${API_BASE_URL}/promotion`, data)
}

/**
 * 2. Update Promotion
 */
export const updatePromotion = (promotionId, data) => {
  return axios.patch(`${API_BASE_URL}/promotion?id=${promotionId}`, data)
}



/**
 * 3. Delete Promotion
 */
export async function deletePromotion(id) {
  return axios.delete(`${API_BASE_URL}/promotion`, {
    params: { id }
  })
}

/**
 * 4. Get Promotions by Outlet
 */
export async function getPromotionsByOutlet(outletId) {
  return axios.get(`${API_BASE_URL}/promotion`, {
    params: { outletId }
  })
}

/**
 * 5. Get Promotion by ID
 */
export async function getPromotionById(id) {
  return axios.get(`${API_BASE_URL}/promotion/${id}`)
}

/**
 * 6. Validate Promotion Code
 */
export async function validatePromotion(data) {
  return axios.post(`${API_BASE_URL}/promotion/validate`, data)
}

/**
 * 7. Get Menu Items by Outlet
 */
export async function getMenuItemsByOutlet(outletId) {
  return axios.get(`${API_BASE_URL}/menuItems`, {
    params: {
      outletId,
      sortKey: 'id',
      sortValue: 'asc',
      isDeleted: true
    }
  })
}
