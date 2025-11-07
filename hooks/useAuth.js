'use client';

import { useSelector, useDispatch } from 'react-redux';
import {
  selectUser,
  selectToken,
  selectIsAuthenticated,
  selectIsAdmin,
  selectAuthLoading,
  selectAuthError,
  logout,
  clearError,
} from '@/store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    loading,
    error,
    logout: () => dispatch(logout()),
    clearError: () => dispatch(clearError()),
  };
};

