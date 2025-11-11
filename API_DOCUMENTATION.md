# API Documentation

This document covers all available endpoints in the User Relationships API.

## Base URL

Development: `http://localhost:8080/api`

## Authentication

Currently no authentication required - all endpoints are public.

## Response Format

### Success Response
All successful responses return JSON with the resource data:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john",
  "age": 28,
  "hobbies": ["reading", "gaming"],
  "friends": ["uuid-456"],
  "createdAt": "2025-11-11T10:30:00Z",
  "popularityScore": 2.5
}
```

### Error Response
```json
{
  "timestamp": "2025-11-11T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Username already exists",
  "path": "/api/users"
}
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created |
| 204 | No Content - Deleted successfully |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Already exists or invalid state |
| 500 | Server Error |

## User Endpoints

### Create User

```
POST /api/users
```

Creates a new user.

**Request:**
```json
{
  "username": "alice",
  "age": 25,
  "hobbies": ["reading", "gaming", "cooking"]
}
```

**Validation:**
- `username`: required, unique
- `age`: required, between 1-150
- `hobbies`: required, at least one hobby

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "alice",
  "age": 25,
  "hobbies": ["reading", "gaming", "cooking"],
  "friends": [],
  "createdAt": "2025-11-11T10:30:00Z",
  "popularityScore": 0
}
```

**Errors:**
- `400` - Missing required fields
- `409` - Username already exists

**Example:**
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "age": 25, "hobbies": ["reading", "gaming"]}'
```

---

### Get All Users

```
GET /api/users
```

Returns a list of all users.

**Response (200):**
```json
[
  {
    "id": "uuid-1",
    "username": "alice",
    "age": 25,
    "hobbies": ["reading", "gaming"],
    "friends": ["uuid-2"],
    "createdAt": "2025-11-11T10:30:00Z",
    "popularityScore": 2.5
  }
]
```

**Example:**
```bash
curl http://localhost:8080/api/users
```

---

### Get User by ID

```
GET /api/users/{id}
```

Get a specific user.

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "alice",
  "age": 25,
  "hobbies": ["reading", "gaming"],
  "friends": ["uuid-2"],
  "createdAt": "2025-11-11T10:30:00Z",
  "popularityScore": 2.5
}
```

**Errors:**
- `404` - User not found

**Example:**
```bash
curl http://localhost:8080/api/users/550e8400-e29b-41d4-a716-446655440000
```

---

### Update User

```
PUT /api/users/{id}
```

Update user information. All fields optional - only send what you want to change.

**Request:**
```json
{
  "age": 26,
  "hobbies": ["reading", "gaming", "coding"]
}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "alice",
  "age": 26,
  "hobbies": ["reading", "gaming", "coding"],
  "friends": ["uuid-2"],
  "createdAt": "2025-11-11T10:30:00Z",
  "popularityScore": 2.5
}
```

**Errors:**
- `404` - User not found
- `409` - New username already exists

**Example:**
```bash
curl -X PUT http://localhost:8080/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"age": 26}'
```

---

### Delete User

```
DELETE /api/users/{id}
```

Delete a user. User must have no friendships.

**Response (204):** No content

**Errors:**
- `404` - User not found
- `409` - User has active friendships (must unlink first)

**Example:**
```bash
curl -X DELETE http://localhost:8080/api/users/550e8400-e29b-41d4-a716-446655440000
```

---

## Relationship Endpoints

### Link Users (Create Friendship)

```
POST /api/users/{userId}/link
```

Create a bidirectional friendship between two users. User B automatically becomes User A's friend and vice versa.

**Request:**
```json
{
  "friendId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "alice",
  "age": 25,
  "hobbies": ["reading", "gaming"],
  "friends": ["550e8400-e29b-41d4-a716-446655440001"],
  "createdAt": "2025-11-11T10:30:00Z",
  "popularityScore": 2.5
}
```

**Errors:**
- `400` - User cannot be friends with themselves
- `404` - User or friend not found
- `409` - Users already friends

**Example:**
```bash
curl -X POST http://localhost:8080/api/users/uuid-1/link \
  -H "Content-Type: application/json" \
  -d '{"friendId": "uuid-2"}'
```

---

### Unlink Users (Remove Friendship)

```
DELETE /api/users/{userId}/unlink
```

Remove a friendship between two users.

**Request:**
```json
{
  "friendId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "alice",
  "age": 25,
  "hobbies": ["reading", "gaming"],
  "friends": [],
  "createdAt": "2025-11-11T10:30:00Z",
  "popularityScore": 0
}
```

**Errors:**
- `400` - Users are not friends
- `404` - User or friend not found

**Example:**
```bash
curl -X DELETE http://localhost:8080/api/users/uuid-1/unlink \
  -H "Content-Type: application/json" \
  -d '{"friendId": "uuid-2"}'
```

---

## Graph Endpoint

### Get Graph Data

```
GET /api/graph
```

Returns all users and their relationships. This is used by the frontend to load the graph visualization.

**Response (200):**
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
    },
    {
      "id": "uuid-2",
      "username": "bob",
      "age": 28,
      "hobbies": ["gaming", "sports"],
      "friends": ["uuid-1"],
      "createdAt": "2025-11-11T10:35:00Z",
      "popularityScore": 1.5
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

**Note:** Relationships are deduplicated - you won't see the same relationship twice.

**Example:**
```bash
curl http://localhost:8080/api/graph
```

---

## Complete Example Workflow

Here's how to use the API from scratch:

**1. Create two users:**
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "age": 25, "hobbies": ["reading"]}'

curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "bob", "age": 28, "hobbies": ["gaming"]}'
```

**2. Get their IDs and link them:**
```bash
curl http://localhost:8080/api/users
# Copy alice's id (uuid-1) and bob's id (uuid-2)

curl -X POST http://localhost:8080/api/users/uuid-1/link \
  -H "Content-Type: application/json" \
  -d '{"friendId": "uuid-2"}'
```

**3. Get the graph:**
```bash
curl http://localhost:8080/api/graph
# See alice and bob connected
```

**4. Add a hobby to alice:**
```bash
curl -X PUT http://localhost:8080/api/users/uuid-1 \
  -H "Content-Type: application/json" \
  -d '{"hobbies": ["reading", "gaming"]}'
# Her popularity score should increase because she now shares a hobby with bob
```

**5. Unlink them:**
```bash
curl -X DELETE http://localhost:8080/api/users/uuid-1/unlink \
  -H "Content-Type: application/json" \
  -d '{"friendId": "uuid-2"}'
```

---

## Data Format

### User Object

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Auto-generated |
| username | string | Unique, 1-255 chars |
| age | number | 1-150 |
| hobbies | string[] | At least 1 |
| friends | string[] | Array of user IDs |
| createdAt | ISO 8601 | Auto-generated |
| popularityScore | number | Calculated: `friends + (shared_hobbies × 0.5)` |

### Popularity Score Examples

**User A:**
- 3 friends
- Shares 2 hobbies with friend 1
- Shares 2 hobbies with friend 2
- Shares 1 hobby with friend 3
- Total: `3 + ((2 + 2 + 1) × 0.5) = 3 + 2.5 = 5.5`

**User B:**
- 1 friend
- Shares 1 hobby with friend
- Total: `1 + (1 × 0.5) = 1.5`

---

## Common Issues

### "Username already exists" (409)
The username is taken. Try a different one.

### "User cannot be friends with themselves" (400)
You tried to link a user to themselves. Pick two different users.

### "Users already friends" (409)
The friendship already exists.

### "Cannot delete user with existing friendships" (409)
The user has friends. Call unlink for each friend first, then delete.

### "User not found" (404)
The ID doesn't exist. Check the ID and try again.

---

## Testing with curl

All examples in this doc use curl. You can also use Postman or any HTTP client.

To test POST/PUT/DELETE requests, make sure to include:
```bash
-H "Content-Type: application/json"
-d '{json data}'
```

For GET requests, just the URL is needed:
```bash
curl http://localhost:8080/api/users
```
