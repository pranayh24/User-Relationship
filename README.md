# User Relationships

A full-stack web application for managing and visualizing user relationships and hobbies. Built with Spring Boot on the backend and React + TypeScript on the frontend, featuring interactive graph visualization with React Flow.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running](#running)
- [API Reference](#api-reference)
- [How It Works](#how-it-works)
- [Database Schema](#database-schema)
- [Troubleshooting](#troubleshooting)

## Overview

User Relationships lets you create users with different hobbies, build friendships between them, and visualize everything in an interactive graph. The app automatically calculates a "popularity score" for each user based on their number of friends and shared hobbies.

You can drag hobbies onto user nodes, connect users to form friendships, and watch the graph update in real time.

## Features

### User Management
- Create users with age and hobbies
- Update user information anytime
- Delete users (with relationship validation)
- View complete user list

### Relationships
- Create friendships between users (bidirectional by default)
- Remove friendships cleanly
- Automatic popularity score recalculation
- Prevent self-friendships and duplicates

### Popularity Scoring
- Calculated as: `friends_count + (shared_hobbies × 0.5)`
- Updates in real time
- Visual indicators (HighScore = green, LowScore = blue)

### Graph Visualization
- Interactive React Flow canvas
- Draggable user nodes
- Animated friendship connections
- Live statistics overlay
- Automatic layout

### Hobby Management
- Drag & drop hobbies onto users
- Add custom hobbies
- Search/filter hobbies
- See hobby distribution across users

## Tech Stack

**Backend:**
- Spring Boot 3.x
- Java 17
- JPA/Hibernate
- H2 Database (in-memory, easily swappable to MySQL)
- Maven

**Frontend:**
- React 18 with TypeScript
- React Flow for graph visualization
- Tailwind CSS for styling
- Framer Motion for animations
- Context API for state management

## Quick Start

### Prerequisites
- Java 17+
- Node.js 16+
- Maven 3.6+

### Start Backend
```bash
cd "D:\projects\User Relationships"
mvn spring-boot:run
```
Backend runs on http://localhost:8080

### Start Frontend
```bash
cd frontend/user-relationship-frontend
npm install
npm start
```
Frontend opens at http://localhost:3000

That's it! You should see an empty graph with a "+" button to create users.

## Project Structure

```
.
├── src/main/java/pr/user_relationships/
│   ├── controller/          # REST endpoints
│   ├── service/             # Business logic
│   ├── entity/              # JPA entities
│   ├── repository/          # Database access
│   ├── dto/                 # Request/Response objects
│   └── exception/           # Custom exceptions
│
├── frontend/user-relationship-frontend/
│   ├── src/components/
│   │   ├── Graph/           # React Flow canvas
│   │   ├── Sidebar/         # Hobby list & drag
│   │   ├── UserManagement/  # Create/edit users
│   │   └── ...
│   ├── src/context/         # Global state
│   └── src/services/        # API calls
│
└── pom.xml
```

## Installation

### Backend

1. Navigate to project root
```bash
cd "D:\projects\User Relationships"
```

2. Install dependencies
```bash
mvn clean install
```

### Frontend

1. Navigate to frontend
```bash
cd frontend/user-relationship-frontend
```

2. Install npm packages
```bash
npm install
```

3. Create .env file
```bash
echo "REACT_APP_API_URL=http://localhost:8080/api" > .env
```

## Running

### Development Mode

**Terminal 1 - Backend:**
```bash
cd "D:\projects\User Relationships"
mvn spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd frontend/user-relationship-frontend
npm start
```

### Production Build

**Frontend:**
```bash
npm run build
```

**Backend:**
```bash
mvn clean package
java -jar target/user_relationships-0.0.1-SNAPSHOT.jar
```

## API Reference

Base URL: `http://localhost:8080/api`

### Users

**Create User**
```http
POST /api/users
Content-Type: application/json

{
  "username": "alice",
  "age": 25,
  "hobbies": ["reading", "gaming"]
}
```

**Get All Users**
```http
GET /api/users
```

**Get User by ID**
```http
GET /api/users/{id}
```

**Update User**
```http
PUT /api/users/{id}
Content-Type: application/json

{
  "age": 26,
  "hobbies": ["reading", "gaming", "coding"]
}
```

**Delete User**
```http
DELETE /api/users/{id}
```
Note: Can't delete user if they have friendships - must unlink first.

### Relationships

**Link Users (Create Friendship)**
```http
POST /api/users/{userId}/link
Content-Type: application/json

{
  "friendId": "other-user-id"
}
```
Creates bidirectional friendship automatically.

**Unlink Users (Remove Friendship)**
```http
DELETE /api/users/{userId}/unlink
Content-Type: application/json

{
  "friendId": "other-user-id"
}
```

### Graph

**Get Graph Data**
```http
GET /api/graph
```
Returns all users and their relationships. Used for initial load and refreshing the graph.

Response:
```json
{
  "users": [
    {
      "id": "uuid-1",
      "username": "alice",
      "age": 25,
      "hobbies": ["reading", "gaming"],
      "friends": ["uuid-2"],
      "createdAt": "2025-11-11T10:30:00Z",
      "popularityScore": 2.5
    }
  ],
  "relationships": [
    {
      "userId1": "uuid-1",
      "userId2": "uuid-2"
    }
  ]
}
```

## How It Works

### Bidirectional Friendships
When User A links with User B, the app automatically adds B to A's friends AND A to B's friends. Only one database entry is created, but both users see the relationship.

### Popularity Score
```
score = number_of_friends + (total_shared_hobbies × 0.5)
```

Example:
- Alice has 3 friends
- Shares 2 hobbies with Bob, 2 with Charlie, 1 with David
- Total shared: 5
- Score: 3 + (5 × 0.5) = 5.5
- Alice gets a green "HighScore" node (popularity > 5)

### Frontend State Management
The app uses React Context to manage global state. When you create a user, add a hobby, or link friends:
1. Frontend sends request to backend
2. Backend processes and updates database
3. Frontend fetches fresh graph data
4. All components update instantly
5. You see the change in the graph

### Drag & Drop
- Drag hobbies from sidebar onto user nodes to add them
- Drag one user node onto another to create a friendship
- Visual feedback shows when you're hovering over valid targets

## Database Schema

### User Table
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  age INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Hobbies (One-to-Many)
```sql
CREATE TABLE user_hobbies (
  user_id VARCHAR(36),
  hobby VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id),
  PRIMARY KEY (user_id, hobby)
);
```

### User Friends (Many-to-Many, Bidirectional)
```sql
CREATE TABLE user_friends (
  user_id VARCHAR(36),
  friend_id VARCHAR(36),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (friend_id) REFERENCES users(id),
  PRIMARY KEY (user_id, friend_id)
);
```

## Troubleshooting

### Backend won't start

**Port 8080 in use:**
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8080
kill -9 <PID>
```

**Maven build fails:**
```bash
mvn clean install -U
```

**Database issues:**
Check H2 console at http://localhost:8080/h2-console
- Default URL: `jdbc:h2:mem:testdb`
- Username: `sa`
- Password: (empty)

### Frontend won't start

**Port 3000 in use:**
```bash
# Kill whatever's using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**npm install fails:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Can't connect to backend:**
- Make sure backend is running on http://localhost:8080
- Check .env file has correct API URL
- Check browser console for CORS errors

### Graph not loading

Check browser console (F12) for errors. Most likely causes:
- Backend not running
- CORS issue (check backend logs)
- No users in database (create one first)

## Notes

- The app uses an in-memory H2 database, so data is reset on restart
- To use MySQL instead, update `application.properties` and add MySQL driver to `pom.xml`
- CORS is configured for localhost:3000 development
- No authentication yet - all endpoints public (planned for v2)

## Future Improvements

- JWT authentication
- User roles/permissions
- Activity logging
- Advanced filtering/search
- Pagination for large datasets
- User profiles
- Export/import data
