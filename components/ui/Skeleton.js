'use client';

export default function Skeleton({ className = '', width, height, rounded = false }) {
  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`skeleton ${rounded ? 'skeleton-rounded' : ''} ${className}`}
      style={style}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <Skeleton height="200px" rounded />
      <div className="skeleton-content">
        <Skeleton height="20px" width="80%" />
        <Skeleton height="16px" width="60%" />
        <Skeleton height="16px" width="40%" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }) {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height="20px" width="100%" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-table-row">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} height="16px" width="100%" />
          ))}
        </div>
      ))}
    </div>
  );
}

