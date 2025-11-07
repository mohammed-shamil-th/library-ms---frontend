'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats, fetchPopularBooks, fetchActiveUsers, fetchBorrowingTrends } from '@/store/slices/dashboardSlice';
import { selectDashboardStats, selectPopularBooks, selectActiveUsers, selectBorrowingTrends, selectDashboardLoading } from '@/store/slices/dashboardSlice';
import AdminRoute from '@/components/layout/AdminRoute';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Link from 'next/link';
import Skeleton from '@/components/ui/Skeleton';


export default function AdminOverviewPage() {
  const dispatch = useDispatch();
  const stats = useSelector(selectDashboardStats);
  const popularBooks = useSelector(selectPopularBooks);
  const activeUsers = useSelector(selectActiveUsers);
  const trends = useSelector(selectBorrowingTrends);
  const loading = useSelector(selectDashboardLoading);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchPopularBooks(10));
    dispatch(fetchActiveUsers(10));
    dispatch(fetchBorrowingTrends(30));
  }, [dispatch]);

  return (
    <AdminRoute>
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <h1 className="dashboard-title">Dashboard Overview</h1>

        {loading && !stats ? (
          <div className="stats-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent style={{ padding: '1.5rem' }}>
                  <Skeleton height="20px" width="60%" style={{ marginBottom: '0.5rem' }} />
                  <Skeleton height="32px" width="40%" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
              <Card>
                <CardHeader>
                  <CardTitle>Total Books</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4a90e2' }}>
                    {stats?.totalBooks || 0}
                  </div>
                  <p style={{ color: '#666', marginTop: '0.5rem' }}>Books in library</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total Borrows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
                    {stats?.totalBorrows || 0}
                  </div>
                  <p style={{ color: '#666', marginTop: '0.5rem' }}>All-time borrows</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#17a2b8' }}>
                    {stats?.activeUsers || 0}
                  </div>
                  <p style={{ color: '#666', marginTop: '0.5rem' }}>Users with active borrows</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Overdue Books</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}>
                    {stats?.overdueBooks || 0}
                  </div>
                  <p style={{ color: '#666', marginTop: '0.5rem' }}>Books past due date</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Borrows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>
                    {stats?.activeBorrows || 0}
                  </div>
                  <p style={{ color: '#666', marginTop: '0.5rem' }}>Currently borrowed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Low Stock</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fd7e14' }}>
                    {stats?.lowStockBooks || 0}
                  </div>
                  <p style={{ color: '#666', marginTop: '0.5rem' }}>Books with low stock</p>
                </CardContent>
              </Card>
            </div>

            {/* Popular Books */}
            <div className="card" style={{ marginBottom: '2rem' }}>
              <CardHeader>
                <CardTitle>Most Popular Books</CardTitle>
              </CardHeader>
              <CardContent>
                {popularBooks.length === 0 ? (
                  <p>No data available</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Borrow Count</TableHead>
                        <TableHead>Available</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {popularBooks.map((book, index) => (
                        <TableRow key={book._id}>
                          <TableCell>#{index + 1}</TableCell>
                          <TableCell>
                            <Link href={`/books/${book._id}`} className="book-title-link">
                              {book.title}
                            </Link>
                          </TableCell>
                          <TableCell>{book.author}</TableCell>
                          <TableCell>{book.borrowCount}</TableCell>
                          <TableCell>
                            {book.availableCopies} / {book.totalCopies}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </div>

            {/* Active Users */}
            <div className="card">
              <CardHeader>
                <CardTitle>Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                {activeUsers.length === 0 ? (
                  <p>No active users</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Active Borrows</TableHead>
                        <TableHead>Max Allowed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeUsers.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.activeBorrows}</TableCell>
                          <TableCell>{user.maxBooksAllowed}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </div>
          </>
        )}
      </div>
    </AdminRoute>
  );
}

