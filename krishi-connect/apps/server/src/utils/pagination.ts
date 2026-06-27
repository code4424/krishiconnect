export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export const getPaginationOptions = (query: any) => {
  const page = Math.max(1, parseInt(query.page || '1'));
  const limit = Math.max(1, Math.min(100, parseInt(query.limit || '10')));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const formatPaginatedResponse = <T>(data: T[], total: number, page: number, limit: number) => {
  return {
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
    },
  };
};
