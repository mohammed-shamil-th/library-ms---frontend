'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Pagination from '@/components/ui/Pagination';
import { showToast } from '@/components/ui/ToastContainer';
import {
  fetchAllBorrows,
  returnBook,
  selectAllBorrows,
  selectBorrowsLoading as selectBorrowsLoadingState,
  selectBorrowsPagination as selectBorrowsPaginationState,
  selectBorrowsFilters as selectBorrowsFiltersState,
  setFilters as setBorrowsFilters,
} from '@/store/slices/borrowsSlice';
import { deleteBorrowAdmin, fetchDashboardStats } from '@/store/slices/adminSlice';

const Trash2 = () => <span className="icon">🗑️</span>;

export default function BorrowsTab() {
  const dispatch = useDispatch();
  const allBorrows = useSelector(selectAllBorrows);
  const borrowsLoading = useSelector(selectBorrowsLoadingState);
  const borrowsPagination = useSelector(selectBorrowsPaginationState);
  const borrowsFilters = useSelector(selectBorrowsFiltersState);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [borrowToDelete, setBorrowToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFilterChange = (key, value) => {
    dispatch(setBorrowsFilters({ [key]: value }));
    dispatch(fetchAllBorrows({ ...borrowsFilters, [key]: value, page: 1, limit: 10 }));
  };

  const handlePageChange = (page) => {
    dispatch(fetchAllBorrows({ ...borrowsFilters, page, limit: 10 }));
  };

  const handleReturnBorrow = async (borrowId) => {
    const result = await dispatch(returnBook(borrowId));
    if (returnBook.fulfilled.match(result)) {
      showToast('Book returned successfully!', 'success');
      dispatch(fetchAllBorrows({ ...borrowsFilters, page: borrowsPagination.page, limit: 10 }));
      dispatch(fetchDashboardStats());
    } else {
      showToast(result.payload || 'Failed to return book', 'error');
    }
  };

  const handleDeleteClick = (borrowId, borrowInfo) => {
    setBorrowToDelete({ id: borrowId, info: borrowInfo });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!borrowToDelete) return;
    
    setIsDeleting(true);
    const result = await dispatch(deleteBorrowAdmin(borrowToDelete.id));
    
    setIsDeleting(false);
    setDeleteModalOpen(false);
    setBorrowToDelete(null);
    
    if (deleteBorrowAdmin.fulfilled.match(result)) {
      showToast('Borrow record deleted successfully', 'success');
      dispatch(fetchAllBorrows({ ...borrowsFilters, page: borrowsPagination.page, limit: 10 }));
      dispatch(fetchDashboardStats());
    } else {
      showToast(result.payload || 'Failed to delete borrow record', 'error');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Borrow Records</CardTitle>
        <CardDescription>Manage active and overdue borrows</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="books-controls">
          <div className="filters-row">
            <select
              value={borrowsFilters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="form-input"
            >
              <option value="">All Status</option>
              <option value="borrowed">Borrowed</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          {borrowsLoading ? (
            <div className="loading-container" style={{ minHeight: '200px' }}>
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Book</TableHead>
                  <TableHead>Borrow Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Return Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fine</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allBorrows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="8" className="text-center">
                      No borrow records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  allBorrows.map((borrow) => (
                    <TableRow key={borrow._id}>
                      <TableCell>
                        {borrow.user?.name || 'Unknown User'}
                        <br />
                        <small style={{ color: '#666' }}>{borrow.user?.email}</small>
                      </TableCell>
                      <TableCell>
                        <Link href={`/books/${borrow.book?._id}`} className="book-title-link">
                          {borrow.book?.title || 'Unknown Book'}
                        </Link>
                        <br />
                        <small style={{ color: '#666' }}>by {borrow.book?.author || 'Unknown Author'}</small>
                      </TableCell>
                      <TableCell>{new Date(borrow.borrowDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(borrow.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>{borrow.returnDate ? new Date(borrow.returnDate).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>
                        <StatusBadge
                          status={borrow.status}
                          variant={
                            borrow.status === 'returned'
                              ? 'success'
                              : borrow.status === 'overdue'
                              ? 'danger'
                              : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {borrow.fine > 0 ? (
                          <span className="text-danger">${borrow.fine.toFixed(2)}</span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="action-buttons">
                          {borrow.status !== 'returned' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReturnBorrow(borrow._id)}
                              title="Mark as Returned"
                            >
                              Return
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(borrow._id, {
                              user: borrow.user?.name || 'Unknown User',
                              book: borrow.book?.title || 'Unknown Book'
                            })}
                            title="Delete"
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {borrowsPagination.pages > 1 && (
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexDirection:'column' }}>
            <Pagination
              currentPage={borrowsPagination.page}
              totalPages={borrowsPagination.pages}
              onPageChange={handlePageChange}
            />
            <span className="pagination-info" style={{ color: '#666', fontSize: '0.875rem' }}>
              ({borrowsPagination.total} total)
            </span>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setBorrowToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Borrow Record"
        message={borrowToDelete ? `Are you sure you want to delete the borrow record for "${borrowToDelete.info.book}" by "${borrowToDelete.info.user}"? This action cannot be undone.` : ''}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
      />
    </Card>
  );
}

