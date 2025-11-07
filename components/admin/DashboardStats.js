'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { BookOpen, TrendingUp, Clock, Users } from 'lucide-react';

export default function DashboardStats({ stats }) {
  const totalBooks = stats?.totalBooks || 0;
  const activeBorrows = stats?.activeBorrows || 0;
  const overdueBorrows = stats?.overdueBooks || 0;
  const activeUsers = stats?.totalUsers || 0;

  return (
    <div className="stats-grid">
      <Card>
        <CardHeader className="stat-card-header">
          <CardTitle className="stat-card-title">Total Books</CardTitle>
          <BookOpen className="stat-icon" size={24} strokeWidth={2} />
        </CardHeader>
        <CardContent>
          <div className="stat-value">{totalBooks}</div>
          <p className="stat-description">In library catalog</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="stat-card-header">
          <CardTitle className="stat-card-title">Active Borrows</CardTitle>
          <TrendingUp className="stat-icon" size={24} strokeWidth={2} />
        </CardHeader>
        <CardContent>
          <div className="stat-value">{activeBorrows}</div>
          <p className="stat-description">Currently borrowed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="stat-card-header">
          <CardTitle className="stat-card-title">Overdue Books</CardTitle>
          <Clock className="stat-icon" size={24} strokeWidth={2} />
        </CardHeader>
        <CardContent>
          <div className="stat-value stat-value-danger">{overdueBorrows}</div>
          <p className="stat-description">Requires attention</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="stat-card-header">
          <CardTitle className="stat-card-title">Active Users</CardTitle>
          <Users className="stat-icon" size={24} strokeWidth={2} />
        </CardHeader>
        <CardContent>
          <div className="stat-value">{activeUsers}</div>
          <p className="stat-description">Registered members</p>
        </CardContent>
      </Card>
    </div>
  );
}

