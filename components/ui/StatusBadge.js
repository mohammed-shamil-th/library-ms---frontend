'use client';

export default function StatusBadge({ status, className = '' }) {
  const statusClass = `status-badge status-badge-${status}`;

  const statusLabels = {
    available: 'Available',
    borrowed: 'Borrowed',
    overdue: 'Overdue',
    returned: 'Returned',
    out_of_stock: 'Out of Stock',
    low_stock: 'Low Stock',
  };

  return (
    <span className={`${statusClass} ${className}`}>
      {statusLabels[status] || status}
    </span>
  );
}

