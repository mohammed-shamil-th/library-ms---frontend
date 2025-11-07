# Testing Guide - Frontend

## Setup

1. Install dependencies:
```bash
npm install
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Structure

Tests are located in `__tests__/` directory:
- `__tests__/components/admin/BookFormModal.test.js` - Tests for book creation form

## Test Coverage

The tests cover:
- ✅ Form rendering
- ✅ Required field validation
- ✅ ISBN format validation
- ✅ Title length validation
- ✅ Form submission with valid data
- ✅ API error handling
- ✅ Modal open/close behavior
- ✅ Available copies validation

## Configuration

- Jest configuration: `jest.config.js`
- Test setup: `jest.setup.js`
- Uses React Testing Library for component testing
- Mocks API calls and external dependencies

## Notes

- Tests use mocked API calls to avoid actual network requests
- Components are tested in isolation with mocked Redux store
- Make sure all dependencies are installed before running tests

