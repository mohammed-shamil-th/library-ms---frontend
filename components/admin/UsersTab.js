'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDebounce } from '@/hooks/useDebounce';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { fetchAllUsers, selectUsers, selectUsersPagination, selectUsersFilters, selectAdminLoading, setUsersFilters } from '@/store/slices/adminSlice';

export default function UsersTab() {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);
  const usersPagination = useSelector(selectUsersPagination);
  const usersFilters = useSelector(selectUsersFilters);
  const adminLoading = useSelector(selectAdminLoading);
  
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const debouncedUserSearch = useDebounce(userSearchQuery, 500);

  // Fetch users on initial mount
  useEffect(() => {
    dispatch(fetchAllUsers({ page: 1, limit: 10 }));
  }, [dispatch]);

  // Fetch users when filters change
  useEffect(() => {
    const params = {
      ...usersFilters,
      page: usersPagination.page,
      limit: 10,
    };
    if (debouncedUserSearch.trim()) {
      params.search = debouncedUserSearch.trim();
    }
    dispatch(fetchAllUsers(params));
  }, [dispatch, usersFilters, usersPagination.page, debouncedUserSearch]);

  const handleFilterChange = (filterName, value) => {
    dispatch(setUsersFilters({ ...usersFilters, [filterName]: value || undefined }));
    dispatch(fetchAllUsers({ ...usersFilters, [filterName]: value || undefined, page: 1, limit: 10 }));
  };

  const handlePageChange = (page) => {
    const params = {
      ...usersFilters,
      page,
      limit: 10,
    };
    if (debouncedUserSearch.trim()) {
      params.search = debouncedUserSearch.trim();
    }
    dispatch(fetchAllUsers(params));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>View library members</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="books-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="form-input"
            />
            {userSearchQuery && (
              <Button
                variant="outline"
                onClick={() => {
                  setUserSearchQuery('');
                }}
              >
                Clear
              </Button>
            )}
          </div>
          <div className="filters-row">
            <select
              value={usersFilters.role || ''}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="form-input"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={usersFilters.isActive || ''}
              onChange={(e) => handleFilterChange('isActive', e.target.value)}
              className="form-input"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          {adminLoading ? (
            <div className="loading-container" style={{ minHeight: '200px' }}>
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Max Books</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Member Since</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="6" className="text-center">
                      {userSearchQuery ? 'No users found matching your search.' : 'No users found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <StatusBadge
                          status={user.role}
                          variant={user.role === 'admin' ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{user.maxBooksAllowed || 3}</TableCell>
                      <TableCell>
                        <StatusBadge
                          status={user.isActive ? 'active' : 'inactive'}
                          variant={user.isActive ? 'success' : 'danger'}
                        />
                      </TableCell>
                      <TableCell>{new Date(user.membershipDate || user.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {usersPagination.pages > 1 && (
          <div className="pagination">
            <Button
              variant="outline"
              onClick={() => handlePageChange(usersPagination.page - 1)}
              disabled={usersPagination.page === 1 || adminLoading}
            >
              Previous
            </Button>
            <span className="pagination-info">
              Page {usersPagination.page} of {usersPagination.pages} ({usersPagination.total} total)
            </span>
            <Button
              variant="outline"
              onClick={() => handlePageChange(usersPagination.page + 1)}
              disabled={usersPagination.page >= usersPagination.pages || adminLoading}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

