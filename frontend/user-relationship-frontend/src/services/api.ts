import { User, CreateUserRequest, UpdateUserRequest, GraphResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class UserAPI {
  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  }

  async getUserById(id: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  }

  async deleteUser(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete user');
  }

  async linkUsers(userId: string, friendId: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendId }),
    });
    if (!response.ok) throw new Error('Failed to link users');
    return response.json();
  }

  async unlinkUsers(userId: string, friendId: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/unlink`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendId }),
    });
    if (!response.ok) throw new Error('Failed to unlink users');
    return response.json();
  }

  async getGraphData(): Promise<GraphResponse> {
    const response = await fetch(`${API_BASE_URL}/graph`);
    if (!response.ok) throw new Error('Failed to fetch graph data');
    return response.json();
  }
}

export const userAPI = new UserAPI();

