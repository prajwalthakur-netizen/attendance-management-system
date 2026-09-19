import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

export const attendanceApi = createApi({
  reducerPath: 'attendanceApi',
  baseQuery,
  tagTypes: ['Attendance'],
  endpoints: (builder) => ({
    punchIn: builder.mutation({
      query: (data) => ({
        url: '/attendance/punch-in',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),
    punchOut: builder.mutation({
      query: (data) => ({
        url: '/attendance/punch-out',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),
    getMyAttendance: builder.query({
      query: (params) => ({
        url: '/attendance/my',
        params,
      }),
      providesTags: ['Attendance'],
    }),
    getTeamAttendance: builder.query({
      query: (params) => ({
        url: '/attendance/team',
        params,
      }),
      providesTags: ['Attendance'],
    }),
    validateAttendance: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/attendance/${id}/validate`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),
  }),
});

export const {
  usePunchInMutation,
  usePunchOutMutation,
  useGetMyAttendanceQuery,
  useGetTeamAttendanceQuery,
  useValidateAttendanceMutation,
} = attendanceApi;