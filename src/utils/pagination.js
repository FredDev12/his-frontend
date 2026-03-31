// src/utils/pagination.js


// ======================================================
// PAGINATION RESPONSE (GET /api/patients)
// ======================================================
export const PaginatedType = {

  page: 1,
  limit: 10,
  total: 0,

  hasNext: false,
  hasPrev: false
}


// ======================================================
// QUERY PARAMS (OPTIONAL HELPERS FRONTEND)
// ======================================================
export const QueryParamsType = {
  page: 1,
  limit: 10
}
