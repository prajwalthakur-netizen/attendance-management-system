import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: (params) => ({
        url: '/users',
        params,
      }),
      providesTags: ['User'],
    }),
    getTeamMembers: builder.query({
      query: () => '/users/my-team',
      providesTags: ['User'],
    }),
    updateUserStatus: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/users/${id}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: ['User'],
    }),
    assignManager: builder.mutation({
      query: ({ id, managerId }) => ({
        url: `/users/${id}/assign-manager`,
        method: 'PATCH',
        body: { managerId },
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetTeamMembersQuery,
  useUpdateUserStatusMutation,
  useAssignManagerMutation,
} = userApi;