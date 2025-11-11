import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { GraphProvider } from './context/GraphContext';
import { NotificationProvider } from './context/NotificationContext';

// Mock the API
jest.mock('./services/api', () => ({
  userAPI: {
    getAllUsers: jest.fn(() => Promise.resolve([])),
    getGraphData: jest.fn(() => Promise.resolve({ users: [], relationships: [] })),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    linkUsers: jest.fn(),
    unlinkUsers: jest.fn(),
  },
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <NotificationProvider>
      <GraphProvider>
        {component}
      </GraphProvider>
    </NotificationProvider>
  );
};

describe('App Integration Tests', () => {
  test('renders without crashing', () => {
    renderWithProviders(<App />);
    expect(screen.getByText(/User Relationship Graph/i)).toBeInTheDocument();
  });

  test('displays loading spinner initially', () => {
    renderWithProviders(<App />);
    expect(screen.getByText(/Loading graph data/i)).toBeInTheDocument();
  });

  test('renders user management button', () => {
    renderWithProviders(<App />);
    const button = screen.getByRole('button', { name: /\+/i });
    expect(button).toBeInTheDocument();
  });
});

describe('User Management', () => {
  test('opens user management panel when + button clicked', async () => {
    renderWithProviders(<App />);

    const button = screen.getByRole('button', { name: /\+/i });
    await button.click();

    // Panel should open
    expect(screen.getByText(/User Management/i)).toBeInTheDocument();
  });
});

describe('Notifications', () => {
  test('notification container renders', () => {
    renderWithProviders(<App />);
    // Container should be in the DOM
    const container = document.querySelector('.fixed.top-4.right-4');
    expect(container).toBeInTheDocument();
  });
});
