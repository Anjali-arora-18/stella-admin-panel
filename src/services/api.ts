const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

export default {
  allUsers: (payload) =>
    `${apiBaseUrl}/users?page=${payload.page}&limit=${payload.limit}&sortKey=${payload.sortBy}&sortValue=${payload.sortOrder}&outletId=${payload.outletId}`,
  getUser: (payload) => `${apiBaseUrl}/users/${payload}`,
  deleteUser: (payload) => `${apiBaseUrl}/users/${payload.id}`,
  allCategories: (payload, sortBy, sortDesc) =>
    `${apiBaseUrl}/menuCategories?outletId=${payload}&limit=100000&sortKey=${sortBy}&sortValue=${sortDesc}`,
  deleteCategory: (payload) => `${apiBaseUrl}/menuCategories/${payload.id}`,
  allSubCategories: (payload) => `${apiBaseUrl}/articles?companyCode=${payload}&limit=100000`,
  allServices: () => `${apiBaseUrl}/outlets`,
  allAreas: (payload) => `${apiBaseUrl}/areas?outletId=${payload}&limit=100000`,
  saveArea: () => `${apiBaseUrl}/areas`,
  createTable: () => `${apiBaseUrl}/tables`,
  deleteArea: (payload) => `${apiBaseUrl}/areas/${payload.id}`,
  deleteTable: (payload) => `${apiBaseUrl}/tables/${payload.id}`,
  allCompanies: () => `${apiBaseUrl}/companies`,
  user: (id: string) => `${apiBaseUrl}/users/${id}`,
  users: ({ page, pageSize }: { page: number; pageSize: number }) =>
    `${apiBaseUrl}/users/?page=${page}&pageSize=${pageSize}`,
  allProjects: () => `${apiBaseUrl}/projects`,
  project: (id: string) => `${apiBaseUrl}/projects/${id}`,
  projects: ({ page, pageSize }: { page: number; pageSize: number }) =>
    `${apiBaseUrl}/projects/?page=${page}&pageSize=${pageSize}`,
  avatars: () => `${apiBaseUrl}/avatars`,
}
