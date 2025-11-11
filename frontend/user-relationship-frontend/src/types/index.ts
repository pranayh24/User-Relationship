// Types for the application
export interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
  friends: string[];
  createdAt: string;
  popularityScore: number;
}

export interface UserDTO extends User {}

export interface CreateUserRequest {
  username: string;
  age: number;
  hobbies: string[];
}

export interface UpdateUserRequest {
  username?: string;
  age?: number;
  hobbies?: string[];
}

export interface LinkRequest {
  friendId: string;
}

export interface Relationship {
  userId1: string;
  userId2: string;
}

export interface GraphResponse {
  users: UserDTO[];
  relationships: Relationship[];
}

export interface GraphNode {
  id: string;
  data: {
    label: string;
    age: number;
    popularityScore: number;
  };
  position: {
    x: number;
    y: number;
  };
  type: 'highScore' | 'lowScore';
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  animated: boolean;
}

export interface NotificationState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

