Allowed methods: GET, POST, PUT, DELETE, OPTIONS
Allowed headers: All (*)
Credentials: Allowed

---

## Error Handling

All error responses follow this format:
```json
{
  "error": "Human-readable error message"
}
```

Or in some cases:
```json
{
  "message": "Error message",
  "status": 400,
  "timestamp": "2024-01-25T10:30:00Z"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider:
- Implement rate limiting per IP
- Cache frequently accessed data
- Add request throttling

---

## Testing the API

### Using cURL

**Create a user:**
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "age": 30,
    "hobbies": ["reading"]
  }'
```

**Get all users:**
```bash
curl http://localhost:8080/api/users
```

**Link users:**
```bash
curl -X POST http://localhost:8080/api/users/{userId}/link \
  -H "Content-Type: application/json" \
  -d '{"friendId": "{friendId}"}'
```

### Using Postman

1. Import the API endpoints
2. Set base URL: `http://localhost:8080/api`
3. Test each endpoint with provided examples
4. Verify CORS headers in responses

---

## Best Practices

1. **Always validate input** before making requests
2. **Handle network errors** gracefully in frontend
3. **Cache graph data** to reduce API calls
4. **Debounce rapid updates** (e.g., hobby additions)
5. **Use timestamps** for conflict detection
6. **Implement retry logic** for failed requests
7. **Monitor API response times** in production

---

## Future Enhancements

- [ ] Pagination for large user lists
- [ ] Search/filter endpoints
- [ ] Batch operations
- [ ] WebSocket for real-time updates
- [ ] GraphQL alternative API
- [ ] API versioning (v1, v2)
- [ ] Request logging and metrics
# API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication
Currently no authentication required. For production, implement JWT or OAuth 2.0.

---

## Endpoints

### Users Management

#### Get All Users
```http
GET /api/users
```

**Response (200 OK)**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "alice",
    "age": 28,
    "hobbies": ["reading", "gaming", "hiking"],
    "friends": ["550e8400-e29b-41d4-a716-446655440001"],
    "createdAt": "2024-01-15T10:30:00Z",
    "popularityScore": 6.5
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "username": "bob",
    "age": 32,
    "hobbies": ["gaming", "cooking"],
    "friends": ["550e8400-e29b-41d4-a716-446655440000"],
    "createdAt": "2024-01-20T14:22:00Z",
    "popularityScore": 5.0
  }
]
```

---

#### Get User by ID
```http
GET /api/users/{id}
```

**Path Parameters**
- `id` (string, required): User UUID

**Response (200 OK)**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "alice",
  "age": 28,
  "hobbies": ["reading", "gaming", "hiking"],
  "friends": ["550e8400-e29b-41d4-a716-446655440001"],
  "createdAt": "2024-01-15T10:30:00Z",
  "popularityScore": 6.5
}
```

**Error Response (404 Not Found)**
```json
{
  "error": "User not found with id: invalid-id"
}
```

---

#### Create User
```http
POST /api/users
Content-Type: application/json
```

**Request Body**
```json
{
  "username": "charlie",
  "age": 25,
  "hobbies": ["photography", "cooking", "travel"]
}
```

**Validation Rules**
- `username`: Required, must be unique, non-blank
- `age`: Required, must be between 1 and 150
- `hobbies`: Required, at least 1 hobby, array of strings

**Response (201 Created)**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "username": "charlie",
  "age": 25,
  "hobbies": ["photography", "cooking", "travel"],
  "friends": [],
  "createdAt": "2024-01-25T09:15:00Z",
  "popularityScore": 0.0
}
```

**Error Responses**

- **409 Conflict** (Duplicate username)
```json
{
  "error": "Username already exists: charlie"
}
```

- **400 Bad Request** (Validation failure)
```json
{
  "error": "Age must be between 1 and 150"
}
```

---

#### Update User
```http
PUT /api/users/{id}
Content-Type: application/json
```

**Path Parameters**
- `id` (string, required): User UUID

**Request Body** (all fields optional)
```json
{
  "username": "charlie_updated",
  "age": 26,
  "hobbies": ["photography", "cooking", "travel", "gaming"]
}
```

**Response (200 OK)**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "username": "charlie_updated",
  "age": 26,
  "hobbies": ["photography", "cooking", "travel", "gaming"],
  "friends": [],
  "createdAt": "2024-01-25T09:15:00Z",
  "popularityScore": 0.0
}
```

---

#### Delete User
```http
DELETE /api/users/{id}
```

**Path Parameters**
- `id` (string, required): User UUID

**Response (204 No Content)**
Empty response body

**Error Response (409 Conflict)**
```json
{
  "error": "Cannot delete user with existing friendships. Please unlink all friends first."
}
```

---

### Relationships Management

#### Link Users (Create Friendship)
```http
POST /api/users/{id}/link
Content-Type: application/json
```

**Path Parameters**
- `id` (string, required): User ID initiating the friendship

**Request Body**
```json
{
  "friendId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Response (200 OK)**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "alice",
  "age": 28,
  "hobbies": ["reading", "gaming", "hiking"],
  "friends": ["550e8400-e29b-41d4-a716-446655440001"],
  "createdAt": "2024-01-15T10:30:00Z",
  "popularityScore": 6.5
}
```

**Error Responses**

- **400 Bad Request** (Same user)
```json
{
  "error": "User cannot be friends with themselves"
}
```

- **409 Conflict** (Already friends)
```json
{
  "error": "Users are already friends"
}
```

---

#### Unlink Users (Remove Friendship)
```http
DELETE /api/users/{id}/unlink
Content-Type: application/json
```

**Path Parameters**
- `id` (string, required): User ID initiating the unlinking

**Request Body**
```json
{
  "friendId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Response (200 OK)**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "alice",
  "age": 28,
  "hobbies": ["reading", "gaming", "hiking"],
  "friends": [],
  "createdAt": "2024-01-15T10:30:00Z",
  "popularityScore": 5.0
}
```

**Error Response (400 Bad Request)**
```json
{
  "error": "Users are not friends"
}
```

---

### Graph Data

#### Get Complete Graph
```http
GET /api/graph
```

**Response (200 OK)**
```json
{
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "alice",
      "age": 28,
      "hobbies": ["reading", "gaming", "hiking"],
      "friends": ["550e8400-e29b-41d4-a716-446655440001"],
      "createdAt": "2024-01-15T10:30:00Z",
      "popularityScore": 6.5
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "username": "bob",
      "age": 32,
      "hobbies": ["gaming", "cooking"],
      "friends": ["550e8400-e29b-41d4-a716-446655440000"],
      "createdAt": "2024-01-20T14:22:00Z",
      "popularityScore": 5.0
    }
  ],
  "relationships": [
    {
      "userId1": "550e8400-e29b-41d4-a716-446655440000",
      "userId2": "550e8400-e29b-41d4-a716-446655440001"
    }
  ]
}
```

---

## Popularity Score Calculation

The popularity score is calculated as:
```
popularityScore = numberOfFriends + (sharedHobbiesAcrossFriends * 0.5)
```

**Example:**
- User has 3 friends
- Friend 1 shares 2 hobbies → +1.0 points
- Friend 2 shares 1 hobby → +0.5 points
- Friend 3 shares 0 hobbies → +0 points
- **Total score:** 3 + 1.5 = 4.5

When a hobby is added to a user:
1. User's hobbies list is updated
2. Popularity score is recalculated
3. Friends' scores are also recalculated automatically

---

## Data Types

### User Object
```typescript
{
  id: string;              // UUID, auto-generated
  username: string;        // Unique, non-blank
  age: number;            // 1-150 inclusive
  hobbies: string[];      // At least 1 required
  friends: string[];      // Array of user IDs
  createdAt: string;      // ISO 8601 timestamp
  popularityScore: number; // Calculated automatically
}
```

### Relationship Object
```typescript
{
  userId1: string;  // First user ID
  userId2: string;  // Second user ID (always > userId1 alphabetically)
}
```

### Link Request
```typescript
{
  friendId: string;  // Target user ID
}
```

---

## HTTP Status Codes

| Code | Meaning | Common Scenarios |
|------|---------|------------------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input, validation error |
| 404 | Not Found | User/resource doesn't exist |
| 409 | Conflict | Duplicate username, already friends, cannot delete with friendships |
| 500 | Internal Server Error | Unexpected server error |

---

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000` (Frontend development)
- `http://localhost:3001` (Alternative frontend)


