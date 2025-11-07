# Library Management System - Frontend

A modern, responsive React (Next.js) frontend application for a Library Management System. Built with Next.js 16, Redux Toolkit, and Tailwind CSS.

## 🚀 Features Implemented

### Public Pages
- ✅ **Home/Landing Page**
  - Featured books carousel with auto-rotation
  - Book categories navigation
  - Search bar with debouncing
  - Quick statistics (total books, active members)
  - Popular books section

- ✅ **Books Catalog Page**
  - Grid view of all books
  - Real-time search functionality
  - Filter sidebar (category, language, availability)
  - Sort options (title, author, year)
  - Pagination with page numbers
  - Book details page

- ✅ **Book Details Page**
  - Complete book information display
  - Availability status
  - Borrow button (if logged in and available)
  - Related books section (up to 5 books)
  - Add to favorites functionality

- ✅ **Login/Register Pages**
  - Form validation
  - Error message display
  - Toggle between login and register

### User Dashboard (Authenticated Users)
- ✅ **My Books Page**
  - Currently borrowed books with due dates
  - Return book button
  - Overdue indicator (red badge)
  - Fine amount display

- ✅ **Borrowing History Page**
  - Complete borrow history table
  - Export to CSV functionality
  - Status indicators

- ✅ **User Profile Page**
  - View and edit profile information
  - Statistics summary
  - Membership details
  - Favorites summary

- ✅ **User Statistics Page**
  - Total books borrowed
  - Active borrows count
  - Overdue books count
  - Total fine amount
  - Favorite category
  - Returned books count

- ✅ **Favorites Page**
  - All favorite books
  - Read/Unread sections with tabs
  - Mark as read/unread functionality
  - Bulk actions (mark all as read/unread)
  - Statistics cards

### Admin Dashboard (Admin Only)
- ✅ **Admin Overview**
  - Statistics cards (total books, borrows, users, overdue)
  - Recent activities
  - Dashboard analytics

- ✅ **Manage Books Page**
  - Books table with edit/delete actions
  - Add new book form/modal
  - Update stock quantities
  - Search and filter books
  - Pagination

- ✅ **Manage Borrows Page**
  - All borrow records table
  - Filter by status (borrowed, returned, overdue)
  - User information
  - Manual return option
  - Fine calculation display
  - Pagination

- ✅ **Users Management Page**
  - List all users
  - View user statistics
  - Search and filter users
  - Pagination

## 🛠️ Technology Stack

- **Framework**: Next.js 16.0.1
- **UI Library**: React 19.2.0
- **State Management**: Redux Toolkit 2.2.7
- **Form Handling**: Formik 2.4.6
- **HTTP Client**: Axios 1.7.9
- **Styling**: Tailwind CSS 4, Global CSS
- **Testing**: Jest 29.7.0, React Testing Library 16.0.0

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **Backend API**: Running on `http://localhost:5000` (or configured URL)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd library-ms---frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000`

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
Runs on `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

## 📁 Project Structure

```
library-ms---frontend/
├── app/                # Next.js app directory (pages)
│   ├── admin/         # Admin pages
│   ├── books/         # Book pages
│   ├── dashboard/     # User dashboard pages
│   ├── login/         # Authentication pages
│   └── page.js        # Home page
├── components/         # Reusable components
│   ├── admin/         # Admin-specific components
│   ├── books/         # Book-related components
│   ├── forms/         # Form components
│   ├── layout/        # Layout components
│   └── ui/            # UI components
├── hooks/              # Custom React hooks
├── lib/               # Library utilities (API client)
├── store/              # Redux store and slices
├── utils/              # Utility functions
└── __tests__/          # Test files
```

## 🎨 Key Components

### Reusable UI Components
- `Button` - Styled button component
- `Card` - Card container component
- `Modal` - Modal dialog component
- `Pagination` - Pagination controls
- `Skeleton` - Loading skeleton component
- `StatusBadge` - Status indicator badge
- `Table` - Data table component
- `Tabs` - Tab navigation component
- `ToastContainer` - Toast notification system
- `ConfirmModal` - Confirmation dialog

### Feature Components
- `BookCard` - Book display card
- `BookGrid` - Books grid layout
- `BookFilters` - Filter sidebar
- `BorrowCard` - Borrow record card
- `Navbar` - Navigation bar with user menu
- `AdminRoute` - Protected admin route wrapper

## 🔐 Authentication

The application uses JWT tokens stored in `localStorage`. The token is automatically included in API requests via Axios interceptors.

### Login Flow
1. User enters credentials
2. API returns JWT token and user data
3. Token and user stored in localStorage and Redux
4. Token included in all subsequent API requests

### Protected Routes
- User routes require authentication
- Admin routes require authentication + admin role
- Unauthenticated users are redirected to login

## 🎯 State Management

Redux Toolkit is used for global state management:

- **authSlice** - Authentication state (user, token, role)
- **booksSlice** - Books catalog state
- **borrowsSlice** - Borrowing state
- **usersSlice** - User profile and stats
- **favoritesSlice** - Favorites state
- **adminSlice** - Admin dashboard state
- **dashboardSlice** - Dashboard analytics

## 🎨 Styling

- **Tailwind CSS 4** for utility-first styling
- **Global CSS** (`app/globals.css`) for custom styles
- **Dark Mode** support with persistence
- **Responsive Design** for mobile, tablet, and desktop

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

See `README_TESTING.md` for detailed testing documentation.

## 📱 Responsive Design

The application is fully responsive:
- **Mobile**: Stacked layouts, card views
- **Tablet**: Grid layouts, optimized spacing
- **Desktop**: Full-width layouts, sidebars

## 🌙 Dark Mode

Dark mode toggle is available in the navbar. Preference is saved in `localStorage` and persists across sessions.

## 🔄 Key Features

### Search & Filtering
- Real-time search with debouncing (500ms)
- Filter by category, language, availability
- Sort by title, author, published year
- Active filter chips with clear option

### Pagination
- Page number navigation
- Previous/Next buttons
- Total count display
- Configurable items per page

### Form Validation
- Client-side validation with Formik
- Real-time error feedback
- Required field indicators
- Length validation

### Error Handling
- User-friendly error messages
- Toast notifications for success/error
- Retry mechanisms
- Loading states

## 🐛 Known Issues

- None currently reported

## 🚧 Future Improvements

- Advanced filters (year range, page count range)
- Export user's borrowing history to PDF
- Barcode scanner for ISBN
- PWA features (offline mode, install prompt)
- Enhanced accessibility features (ARIA labels, keyboard navigation)
- Image lazy loading optimization
- Infinite scroll option (currently using pagination)

## 🤖 AI Tools Used

This project was developed with assistance from:
- **Cursor AI** - Component generation, state management, styling
- **GitHub Copilot** - Code suggestions and autocomplete

AI tools helped with:
- Component architecture design
- Redux slice implementation
- Form validation logic
- API integration patterns
- Responsive design implementation
- Test case generation

## 📄 License

ISC

## 👤 Author

Library Management System Development Team

## 📞 Support

For issues and questions, please open an issue on the GitHub repository.
