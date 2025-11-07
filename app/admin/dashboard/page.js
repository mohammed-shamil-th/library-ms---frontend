'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AdminRoute from '@/components/layout/AdminRoute';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import ToastContainer from '@/components/ui/ToastContainer';
import DashboardStats from '@/components/admin/DashboardStats';
import BooksTab from '@/components/admin/BooksTab';
import BorrowsTab from '@/components/admin/BorrowsTab';
import UsersTab from '@/components/admin/UsersTab';
import BookFormModal from '@/components/admin/BookFormModal';
import { fetchDashboardStats, selectDashboardStats } from '@/store/slices/adminSlice';
import { fetchAllBorrows, selectBorrowsFilters as selectBorrowsFiltersState } from '@/store/slices/borrowsSlice';

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const dashboardStats = useSelector(selectDashboardStats);
  const borrowsFilters = useSelector(selectBorrowsFiltersState);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);

  // Fetch dashboard stats on mount
  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  // Fetch borrows when filters change
  useEffect(() => {
    dispatch(fetchAllBorrows({ ...borrowsFilters, page: 1, limit: 10 }));
  }, [dispatch, borrowsFilters]);

  const handleAddBook = () => {
    setEditingBookId(null);
    setIsModalOpen(true);
  };

  const handleEditBook = (bookId) => {
    setEditingBookId(bookId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBookId(null);
  };

  return (
    <AdminRoute>
      <div className="admin-dashboard">
        <ToastContainer />
        <div className="container">
          <h1 className="dashboard-title">Admin Dashboard</h1>

          <DashboardStats stats={dashboardStats} />

          <Tabs defaultValue="books" className="dashboard-tabs">
            <TabsList>
              <TabsTrigger value="books">Manage Books</TabsTrigger>
              <TabsTrigger value="borrows">Manage Borrows</TabsTrigger>
              <TabsTrigger value="users">Manage Users</TabsTrigger>
            </TabsList>

            <TabsContent value="books">
              <BooksTab onAddBook={handleAddBook} onEditBook={handleEditBook} />
            </TabsContent>

            <TabsContent value="borrows">
              <BorrowsTab />
            </TabsContent>

            <TabsContent value="users">
              <UsersTab />
            </TabsContent>
          </Tabs>
        </div>

        <BookFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          editingBookId={editingBookId}
          setEditingBookId={setEditingBookId}
        />
      </div>
    </AdminRoute>
  );
}
