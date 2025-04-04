const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

export default {
  allUsers: () => `${apiBaseUrl}/users`,
  allCategories: (payload) => `${apiBaseUrl}/families?companyCode=${payload}`,
  allSubCategories: (payload) => `${apiBaseUrl}/articles?companyCode=${payload}`,
  allServices: () => `${apiBaseUrl}/outlets`,
  allAreas: (payload) => `${apiBaseUrl}/areas?outletId=${payload}`,
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
