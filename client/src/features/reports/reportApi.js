import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

export const reportApi = createApi({
  reducerPath: 'reportApi',
  baseQuery,
  endpoints: (builder) => ({
    getDailyReport: builder.query({
      query: (params) => ({
        url: '/reports/daily',
        params,
      }),
    }),
  }),
});

export const { useGetDailyReportQuery } = reportApi;