import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import booksReducer from './slices/booksSlice';
import borrowsReducer from './slices/borrowsSlice';
import usersReducer from './slices/usersSlice';
import dashboardReducer from './slices/dashboardSlice';
import favoritesReducer from './slices/favoritesSlice';
import adminReducer from './slices/adminSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      books: booksReducer,
      borrows: borrowsReducer,
      users: usersReducer,
      dashboard: dashboardReducer,
      favorites: favoritesReducer,
      admin: adminReducer,
    },
  });
};

