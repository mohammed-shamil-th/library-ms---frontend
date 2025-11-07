import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import BookFormModal from '@/components/admin/BookFormModal';
import booksReducer from '@/store/slices/booksSlice';

// Mock the API
jest.mock('@/lib/api', () => ({
  booksAPI: {
    createBook: jest.fn(),
    getBookById: jest.fn(),
    updateBook: jest.fn(),
  },
}));

// Mock toast
jest.mock('@/components/ui/ToastContainer', () => ({
  showToast: jest.fn(),
}));

// Mock Modal component
jest.mock('@/components/ui/Modal', () => {
  const React = require('react');
  return function MockModal({ isOpen, children, onClose, title }) {
    if (!isOpen) return null;
    return React.createElement('div', { 'data-testid': 'modal' },
      title && React.createElement('h2', null, title),
      children,
      React.createElement('button', { onClick: onClose }, 'Close')
    );
  };
});

// Mock Button component
jest.mock('@/components/ui/Button', () => {
  const React = require('react');
  return function MockButton({ children, onClick, disabled, type = 'button' }) {
    return React.createElement('button', { onClick, disabled, type }, children);
  };
});

// Mock FormInput component
jest.mock('@/components/forms/FormInput', () => {
  const React = require('react');
  return function MockFormInput({ label, name, value, onChange, onBlur, error, ...props }) {
    return React.createElement('div', null,
      React.createElement('label', { htmlFor: name }, label),
      React.createElement('input', {
        id: name,
        name,
        value: value || '',
        onChange,
        onBlur,
        ...props
      }),
      error && React.createElement('div', { className: 'error' }, error)
    );
  };
});

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      books: booksReducer,
      auth: (state = { user: null, token: null, isAuthenticated: false, isAdmin: false }) => state,
    },
    preloadedState: {
      books: {
        books: [],
        currentBook: null,
        loading: false,
        error: null,
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        filters: {},
        searchQuery: '',
        isSearching: false,
        ...initialState,
      },
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isAdmin: false,
      },
    },
  });
};

describe('BookFormModal - Create Book', () => {
  let store;
  const mockOnClose = jest.fn();
  const mockSetEditingBookId = jest.fn();
  let booksAPI;
  let showToast;

  beforeEach(() => {
    store = createMockStore();
    jest.clearAllMocks();
    booksAPI = require('@/lib/api').booksAPI;
    showToast = require('@/components/ui/ToastContainer').showToast;
  });

  test('should render form fields for creating a new book', () => {
    render(
      <Provider store={store}>
        <BookFormModal
          isOpen={true}
          onClose={mockOnClose}
          editingBookId={null}
          setEditingBookId={mockSetEditingBookId}
        />
      </Provider>
    );

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/author/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/isbn/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
  });

  test('should validate required fields', async () => {
    render(
      <Provider store={store}>
        <BookFormModal
          isOpen={true}
          onClose={mockOnClose}
          editingBookId={null}
          setEditingBookId={mockSetEditingBookId}
        />
      </Provider>
    );

    const submitButton = screen.getByRole('button', { name: /add book/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
  });

  test('should validate ISBN format', async () => {
    render(
      <Provider store={store}>
        <BookFormModal
          isOpen={true}
          onClose={mockOnClose}
          editingBookId={null}
          setEditingBookId={mockSetEditingBookId}
        />
      </Provider>
    );

    const isbnInput = screen.getByLabelText(/isbn/i);
    fireEvent.change(isbnInput, { target: { value: '123' } });
    fireEvent.blur(isbnInput);

    await waitFor(() => {
      expect(screen.getByText(/isbn must be exactly 13 digits/i)).toBeInTheDocument();
    });
  });

  test('should validate ISBN with 13 digits', async () => {
    render(
      <Provider store={store}>
        <BookFormModal
          isOpen={true}
          onClose={mockOnClose}
          editingBookId={null}
          setEditingBookId={mockSetEditingBookId}
        />
      </Provider>
    );

    const isbnInput = screen.getByLabelText(/isbn/i);
    fireEvent.change(isbnInput, { target: { value: '9781234567890' } });
    fireEvent.blur(isbnInput);

    await waitFor(() => {
      expect(screen.queryByText(/isbn must be exactly 13 digits/i)).not.toBeInTheDocument();
    });
  });

  test('should validate title length', async () => {
    render(
      <Provider store={store}>
        <BookFormModal
          isOpen={true}
          onClose={mockOnClose}
          editingBookId={null}
          setEditingBookId={mockSetEditingBookId}
        />
      </Provider>
    );

    const titleInput = screen.getByLabelText(/title/i);
    const longTitle = 'A'.repeat(201);
    fireEvent.change(titleInput, { target: { value: longTitle } });
    fireEvent.blur(titleInput);

    await waitFor(() => {
      expect(screen.getByText(/title must not exceed 200 characters/i)).toBeInTheDocument();
    });
  });

  test('should submit form with valid data', async () => {
    booksAPI.createBook.mockResolvedValue({
      success: true,
      data: {
        _id: '123',
        title: 'Test Book',
        author: 'Test Author',
        isbn: '9781234567890',
        category: 'Fiction',
      },
    });

    render(
      <Provider store={store}>
        <BookFormModal
          isOpen={true}
          onClose={mockOnClose}
          editingBookId={null}
          setEditingBookId={mockSetEditingBookId}
        />
      </Provider>
    );

    // Fill form
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Book' },
    });
    fireEvent.change(screen.getByLabelText(/author/i), {
      target: { value: 'Test Author' },
    });
    fireEvent.change(screen.getByLabelText(/isbn/i), {
      target: { value: '9781234567890' },
    });
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'Fiction' },
    });

    // Submit
    const submitButton = screen.getByRole('button', { name: /add book/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(booksAPI.createBook).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Book',
          author: 'Test Author',
          isbn: '9781234567890',
          category: 'Fiction',
        })
      );
    });
  });

  test('should handle API error on submit', async () => {
    booksAPI.createBook.mockRejectedValue({
      response: {
        data: {
          message: 'Book creation failed',
        },
      },
    });

    render(
      <Provider store={store}>
        <BookFormModal
          isOpen={true}
          onClose={mockOnClose}
          editingBookId={null}
          setEditingBookId={mockSetEditingBookId}
        />
      </Provider>
    );

    // Fill form
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Book' },
    });
    fireEvent.change(screen.getByLabelText(/author/i), {
      target: { value: 'Test Author' },
    });
    fireEvent.change(screen.getByLabelText(/isbn/i), {
      target: { value: '9781234567890' },
    });
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'Fiction' },
    });

    // Submit
    const submitButton = screen.getByRole('button', { name: /add book/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(booksAPI.createBook).toHaveBeenCalled();
    });
  });

  test('should not render when isOpen is false', () => {
    render(
      <Provider store={store}>
        <BookFormModal
          isOpen={false}
          onClose={mockOnClose}
          editingBookId={null}
          setEditingBookId={mockSetEditingBookId}
        />
      </Provider>
    );

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  test('should call onClose when close button is clicked', () => {
    render(
      <Provider store={store}>
        <BookFormModal
          isOpen={true}
          onClose={mockOnClose}
          editingBookId={null}
          setEditingBookId={mockSetEditingBookId}
        />
      </Provider>
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should validate availableCopies does not exceed totalCopies', async () => {
    render(
      <Provider store={store}>
        <BookFormModal
          isOpen={true}
          onClose={mockOnClose}
          editingBookId={null}
          setEditingBookId={mockSetEditingBookId}
        />
      </Provider>
    );

    const totalCopiesInput = screen.getByLabelText(/total copies/i);
    const availableCopiesInput = screen.getByLabelText(/available copies/i);

    fireEvent.change(totalCopiesInput, { target: { value: '5' } });
    fireEvent.change(availableCopiesInput, { target: { value: '10' } });
    fireEvent.blur(availableCopiesInput);

    await waitFor(() => {
      expect(screen.getByText(/available copies cannot exceed total copies/i)).toBeInTheDocument();
    });
  });
});

