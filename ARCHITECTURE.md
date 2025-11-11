│       │   ├── Sidebar (Conditional)
│       │   │   ├── HobbySearch
│       │   │   ├── HobbyList
│       │   │   │   └── DraggableHobbyItem[]
│       │   │   └── AddHobbyForm
│       │   └── GraphCanvas
│       │       ├── ReactFlow
│       │       │   ├── HighScoreNode[]
│       │       │   ├── LowScoreNode[]
│       │       │   └── Edge[] (connections)
│       │       ├── Controls
│       │       ├── Background
│       │       └── StatsOverlay
│       ├── FloatingActionButton (+)
│       ├── UserManagementPanel (Modal)
│       │   ├── UserForm
│       │   │   ├── UsernameInput
│       │   │   ├── AgeSlider
│       │   │   └── HobbyInput
│       │   ├── UserList
│       │   └── ConfirmDialog
│       └── NotificationContainer
│           └── NotificationToast[]
```

### State Management Flow

```
GraphContext (Global State)
├── Users (UserDTO[])
├── Loading (boolean)
├── Error (string | null)
├── SelectedUserId (string | null)
├── DraggingHobby (string | null)
├── History (for undo/redo)
└── Actions
    ├── setUsers()
    ├── addUser()
    ├── updateUser()
    ├── deleteUser()
    ├── setSelectedUser()
    ├── setDraggingHobby()
    ├── undo()
    └── redo()

NotificationContext (Toast State)
├── Notifications (NotificationState[])
├── Actions
    ├── addNotification()
    └── removeNotification()
```

### Data Flow

```
1. USER INTERACTION
   ↓
2. COMPONENT ACTION
   (onClick, onDragStart, etc.)
   ↓
3. API CALL
   (userAPI.createUser, etc.)
   ↓
4. STATE UPDATE
   (GraphContext dispatch)
   ↓
5. RE-RENDER
   (Component updates)
   ↓
6. NOTIFICATION
   (Success/Error toast)
```

### Key Patterns

#### Custom Hooks
```typescript
useDebounce()      // Debounce rapid function calls
useLocalStorage()  // Persist state to localStorage
useAsync()         // Manage async operations
useGraph()         // Access graph context
useNotification()  // Trigger notifications
```

#### Higher-Order Components
```typescript
ErrorBoundary      // Catch React errors
withProviders()    // Wrap with context providers (implicit)
```

#### Render Patterns
```typescript
Conditional Rendering    // Loading, error states
Lazy Loading            // React.lazy() for code splitting
Memoization             // React.memo() for performance
```

## Backend Architecture

### Layered Architecture

```
┌─────────────────────────────────┐
│      Controller Layer           │
│  (HTTP endpoints, validation)   │
│  - UserController              │
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│      Service Layer              │
│  (Business logic)               │
│  - UserService                  │
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│   Repository Layer              │
│  (Data access)                  │
│  - UserRepository               │
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│      Database Layer             │
│  (PostgreSQL)                   │
│  - users table                  │
│  - user_hobbies table           │
│  - user_friends table           │
└─────────────────────────────────┘
```

### Entity Relationships

```
User (1) ─────── (M) Hobby
  │
  └── (M─M) User (Friends)

user_hobbies table (ElementCollection)
- user_id (FK)
- hobby (String)

user_friends table (ManyToMany JoinTable)
- user_id (FK)
- friend_id (FK) - bidirectional
```

### Service Logic

```
UserService
├── getAllUsers()
│   └── Convert to DTOs
│
├── getUserById(id)
│   └── Find & convert to DTO
│
├── createUser(request)
│   ├── Validate username uniqueness
│   ├── Create entity
│   └── Save & return DTO
│
├── updateUser(id, request)
│   ├── Find user
│   ├── Update fields
│   └── Save & return DTO
│
├── deleteUser(id)
│   ├── Check no friendships
│   └── Delete user
│
├── linkUsers(userId, friendId)
│   ├── Find both users
│   ├── Add bidirectional friendship
│   └── Save & return DTO
│
├── unlinkUsers(userId, friendId)
│   ├── Find both users
│   ├── Remove bidirectional friendship
│   └── Save & return DTO
│
└── getGraphData()
    ├── Get all users
    ├── Get all relationships
    └── Return combined response
```

## Data Models

### User Entity
```java
@Entity
@Table(name = "users")
class User {
  String id              // UUID, Primary Key
  String username        // Unique, Required
  Integer age            // 1-150
  List<String> hobbies   // ElementCollection
  Set<User> friends      // ManyToMany (bidirectional)
  LocalDateTime createdAt // Timestamp
  Double popularityScore // Transient (calculated)
}
```

### API DTOs
```typescript
UserDTO {
  id: string
  username: string
  age: number
  hobbies: string[]
  friends: string[]
  createdAt: string
  popularityScore: number
}

CreateUserRequest {
  username: string
  age: number
  hobbies: string[]
}

UpdateUserRequest {
  username?: string
  age?: number
  hobbies?: string[]
}

LinkRequest {
  friendId: string
}

GraphResponse {
  users: UserDTO[]
  relationships: Relationship[]
}

Relationship {
  userId1: string
  userId2: string
}
```

## Feature Implementation Details

### 1. Graph Visualization

**Components Involved:**
- GraphCanvas.tsx
- HighScoreNode.tsx (popular: score > 5)
- LowScoreNode.tsx (regular: score ≤ 5)
- React Flow library

**Flow:**
```
Load Users
├── Create Node array with positions
├── Assign node type based on score
├── Render with React Flow
└── Handle interactions
    ├── Node selection
    ├── Edge creation (link users)
    └── Edge deletion (unlink users)
```

### 2. Hobby Management

**Components Involved:**
- Sidebar.tsx
- DraggableHobbyItem
- GraphCanvas (drop zone)

**Flow:**
```
Display Hobbies
├── Extract all unique hobbies from users
├── Search/filter
├── Make draggable
└── Handle drop on user node
    ├── Validate
    ├── API call to update user
    ├── Update state
    └── Show notification
```

### 3. User CRUD Operations

**Components Involved:**
- UserManagementPanel.tsx
- UserForm
- UserList

**Flow:**
```
User Management
├── Display form for creation
├── Show user list
├── Handle edit action
│   ├── Populate form
│   └── Update on submit
├── Handle delete action
│   ├── Show confirmation
│   └── Delete on confirm
└── Handle hobby management
    ├── Add hobby
    ├── Remove hobby
    └── Validate (min 1)
```

### 4. Popularity Score

**Calculation:**
```
Score = Number of Friends + (Shared Hobbies × 0.5)

Example:
User Alice
├── Friends: Bob, Charlie (2)
├── Shared with Bob: gaming, reading (2 hobbies)
├── Shared with Charlie: gaming (1 hobby)
├── Calculation: 2 + ((2 + 1) × 0.5) = 2 + 1.5 = 3.5
└── Visual: LowScoreNode (≤ 5)
```

**Updates:**
- When hobby added: Recalculate self + friends
- When friendship created: Recalculate both
- When friendship removed: Recalculate both

### 5. Error Handling

**Frontend:**
```
Try-Catch in API calls
├── Network errors
├── Validation errors (400)
├── Not found (404)
├── Conflict (409)
└── Server errors (500)
│
└── Show toast notification
    ├── Type: error/warning
    ├── Message: User-friendly
    └── Duration: 3000ms
```

**Backend:**
```
Global Exception Handler
├── ValidationException (400)
├── ResourceNotFoundException (404)
├── ConflictException (409)
└── Generic Exception (500)
│
└── JSON error response
```

## Performance Optimizations

### Frontend

1. **Memoization**
   ```typescript
   React.memo(Component)          // Prevent re-renders
   useMemo(calculation, deps)     // Cache computed values
   useCallback(fn, deps)          // Stable function references
   ```

2. **Debouncing**
   ```typescript
   useDebounce(updateHobby, 300)  // Wait 300ms before API call
   ```

3. **Lazy Loading**
   ```typescript
   React.lazy(() => import('./Component'))
   <Suspense fallback={<LoadingSpinner />}>
   ```

4. **Code Splitting**
   - Separate chunks for components
   - Load on-demand with React Router

### Backend

1. **Database Indexing**
   - Username (unique index)
   - User ID (primary key)

2. **Connection Pooling**
   - HikariCP (default in Spring Boot)
   - Min: 5, Max: 20 connections

3. **JPA Caching**
   - L1 cache (session level)
   - Query result caching

4. **API Response Caching**
   - Cache graph data for 60s
   - Invalidate on mutations

## Security Considerations

### Frontend
- Input validation before API calls
- XSS prevention (React escapes by default)
- CSRF tokens (if needed)
- Secure localStorage usage

### Backend
- Input validation on all endpoints
- SQL injection prevention (JPA parameterized)
- CORS configuration
- Rate limiting (recommended)
- Request size limits

## Scalability Plan

### Phase 1: Current (< 1000 users)
- Single PostgreSQL instance
- Single backend server
- Frontend static hosting

### Phase 2: Medium (1000-100k users)
- Database replication
- Multiple backend instances (load balanced)
- Redis caching
- CDN for frontend

### Phase 3: Large (> 100k users)
- Horizontal sharding by user
- Microservices (Users, Relationships, etc.)
- Message queue (RabbitMQ, Kafka)
- Graph database (Neo4j) for relationships
- Elasticsearch for search

## Development Workflow

```
Feature Development
├── Create feature branch
├── Develop on local
│   ├── Backend: mvn spring-boot:run
│   ├── Frontend: npm start
│   └── Test manually
├── Run tests
│   ├── Backend: mvn test
│   └── Frontend: npm test
├── Code review
├── Merge to main
└── Deploy to production
```

## Monitoring & Observability

### Backend
- Spring Boot Actuator endpoints
- Application logs
- Database query logs
- Performance metrics

### Frontend
- Browser console logs
- React DevTools
- Performance profiler
- Network tab monitoring

## Deployment Architecture

### Development
```
Local Machine
├── Spring Boot: http://localhost:8080
├── React: http://localhost:3000
└── PostgreSQL: localhost:5432
```

### Production
```
Cloud Platform (AWS/Azure/GCP)
├── RDS PostgreSQL (managed)
├── EC2/AppService (Spring Boot, load balanced)
├── S3/Blob Storage (React build)
├── CloudFront/CDN (static assets)
└── CloudWatch/Application Insights (monitoring)
```

### Docker Deployment
```
Docker Compose
├── Postgres service
├── Spring Boot service
└── React service (optional, serve as static)
```

## Testing Strategy

### Unit Tests
- Service layer logic
- Utility functions
- Custom hooks

### Integration Tests
- API endpoint behavior
- Database operations
- Context state changes

### E2E Tests
- User workflows
- Full application flow
- Cross-browser compatibility

### Performance Tests
- Load testing (100+ concurrent users)
- Response time benchmarking
- Database query optimization

## Version History

- **v0.1.0** (Current)
  - User CRUD operations
  - Friendship management
  - Hobby assignment
  - Graph visualization
  - Web UI

- **v0.2.0** (Planned)
  - User authentication
  - Advanced search
  - Hobby categories
  - User profiles
  - Activity feed

- **v1.0.0** (Future)
  - Recommendation engine
  - Chat functionality
  - Event creation
  - Group management
  - Social feed
# User Relationships System - Architecture & Design

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Relationship Graph                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐              ┌──────────────────────┐ │
│  │   React Frontend     │              │  Spring Boot Backend │ │
│  │  (TypeScript)        │◄──────HTTP───►│  (Java 21)           │ │
│  │  Port: 3000          │   REST API    │  Port: 8080          │ │
│  └──────────────────────┘              └──────────────────────┘ │
│           │                                       │               │
│           │                                       │               │
│  ┌────────▼────────┐                  ┌──────────▼──────────┐   │
│  │ React Flow      │                  │ PostgreSQL Database  │   │
│  │ Visualization   │                  │ (JPA/Hibernate)      │   │
│  └─────────────────┘                  └─────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Hierarchy

```
App (Root)
├── ErrorBoundary
│   └── AppContent
│       ├── TopBar
│       │   ├── MenuButton
│       │   ├── Stats Display
│       │   └── RefreshButton
│       ├── MainContent

