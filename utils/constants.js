// Application constants
export const MAX_BOOKS_ALLOWED = 3;
export const FINE_PER_DAY = 1;
export const BORROW_PERIOD_DAYS = 14;

// Book categories
export const BOOK_CATEGORIES = [
  'Fiction',
  'Non-Fiction',
  'Science',
  'Technology',
  'History',
  'Biography',
  'Philosophy',
  'Religion',
  'Art',
  'Literature',
  'Education',
  'Business',
  'Health',
  'Travel',
  'Cooking',
  'Sports',
  'Other',
];

// Borrow statuses
export const BORROW_STATUSES = {
  BORROWED: 'borrowed',
  RETURNED: 'returned',
  OVERDUE: 'overdue',
};

// Date formatting
export const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Calculate days until due
export const daysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Check if overdue
export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  const now = new Date();
  const due = new Date(dueDate);
  return now > due;
};

