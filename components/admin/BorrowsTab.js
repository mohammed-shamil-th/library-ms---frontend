'use client';

import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
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

  const handleDeleteBorrow = async (borrowId) => {
    if (!confirm('Are you sure you want to delete this borrow record?')) return;
    const result = await dispatch(deleteBorrowAdmin(borrowId));
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
                            onClick={() => handleDeleteBorrow(borrow._id)}
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
          <div className="pagination">
            <Button
              variant="outline"
              onClick={() => handlePageChange(borrowsPagination.page - 1)}
              disabled={borrowsPagination.page === 1 || borrowsLoading}
            >
              Previous
            </Button>
            <span className="pagination-info">
              Page {borrowsPagination.page} of {borrowsPagination.pages} ({borrowsPagination.total} total)
            </span>
            <Button
              variant="outline"
              onClick={() => handlePageChange(borrowsPagination.page + 1)}
              disabled={borrowsPagination.page >= borrowsPagination.pages || borrowsLoading}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

