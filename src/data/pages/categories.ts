import api from '../../services/api'
import axios from 'axios'
export const getCategories = async (payload, sortBy, sortDesc) => {
  const { data } = await axios.get(api.allCategories(payload, sortBy, sortDesc))
  return {
    data: data,
  }
}

export const deleteCategory = async (payload) => {
  const { data } = await axios.delete(api.deleteCategory(payload))
  return {
    data: data,
  }
}

// export const updateUser = async (user: User) => {
//   const headers = new Headers()
//   headers.append('Content-Type', 'application/json')

//   const result = await fetch(api.user(user.id), { method: 'PUT', body: JSON.stringify(user), headers }).then((r) =>
//     r.json(),
//   )

//   if (!result.error) {
//     return result
//   }

//   throw new Error(result.error)
// }
