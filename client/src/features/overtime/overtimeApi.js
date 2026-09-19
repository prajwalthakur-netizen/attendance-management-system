import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

export const overtimeApi = createApi({
  reducerPath: 'overtimeApi',
  baseQuery,
  tagTypes: ['Overtime'],
  endpoints: (builder) => ({
    requestOvertime: builder.mutation({
      query: (data) => ({
        url: '/overtime',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Overtime'],
    }),
    getMyOvertime: builder.query({
      query: (params) => ({
        url: '/overtime/my',
        params,
      }),
      providesTags: ['Overtime'],
    }),
    getPendingOvertime: builder.query({
      query: (params) => ({
        url: '/overtime/pending',
        params,
      }),
      providesTags: ['Overtime'],
    }),
    reviewOvertime: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/overtime/${id}/review`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Overtime'],
    }),
  }),
});

export const {
  useRequestOvertimeMutation,
  useGetMyOvertimeQuery,
  useGetPendingOvertimeQuery,
  useReviewOvertimeMutation,
} = overtimeApi;