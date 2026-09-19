import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { authApi } from '../features/auth/authApi';
import { attendanceApi } from '../features/attendance/attendanceApi';
import { overtimeApi } from '../features/overtime/overtimeApi';
import { userApi } from '../features/users/userApi';
import { reportApi } from '../features/reports/reportApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [attendanceApi.reducerPath]: attendanceApi.reducer,
    [overtimeApi.reducerPath]: overtimeApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [reportApi.reducerPath]: reportApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      attendanceApi.middleware,
      overtimeApi.middleware,
      userApi.middleware,
      reportApi.middleware
    ),
});