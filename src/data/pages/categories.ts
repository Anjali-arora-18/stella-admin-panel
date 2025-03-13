import api from '../../services/api'
import axios from 'axios'
export const getCategories = async (payload) => {
  const { data } = await axios.get(api.allCategories(payload))
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
