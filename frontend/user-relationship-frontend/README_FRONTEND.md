# User Relationship Graph Frontend

A modern, feature-rich React TypeScript application for visualizing and managing user relationships as an interactive graph. Built with React Flow, Tailwind CSS, Framer Motion, and comprehensive state management.

## 🚀 Features

### 1. **Interactive Graph Visualization**
- Real-time visualization of users as nodes and friendships as edges
- Two custom node types: HighScoreNode (popularity > 5) and LowScoreNode (popularity ≤ 5)
- Smooth animations and transitions using Framer Motion
- Dynamic node sizing based on popularity score
- Drag-and-drop user connections to create friendships

### 2. **User Management**
- Create, read, update, and delete users
- Form validation with helpful error messages
- Age range validation (1-150 years)
- Delete confirmation dialog with friendship check
- Real-time user statistics display

### 3. **Hobby Management**
- Draggable hobby items in sidebar
- Search/filter hobbies by name
- Add hobbies to users by dragging onto graph nodes
- Track hobby distribution across users
- Add new hobbies directly from the sidebar

### 4. **State Management**
- Context-based state management with React Context API
- Real-time data synchronization with backend
- Automatic popularity score recalculation
- Error handling and user notifications

### 5. **User Interface**
- Beautiful gradient-based design with Tailwind CSS
- Toast notifications for success/error messages
- Loading spinners during API calls
- Error boundaries for graceful error handling
- Responsive sidebar that can be toggled
- Real-time graph statistics overlay

### 6. **Performance Optimizations**
- Debounced API calls for hobby updates
- Memoized selectors and callbacks
- Lazy component rendering
- Efficient graph layout algorithm

## 📋 Prerequisites

- Node.js 16+ and npm 8+
- Backend API running at `http://localhost:8080/api`
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🛠️ Installation

### 1. Clone/Navigate to the project
```bash
cd "D:\projects\User Relationships\frontend\user-relationship-frontend"
```

### 2. Install dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Configure Environment
Create or update `.env` file:
```env
REACT_APP_API_URL=http://localhost:8080/api
```

### 4. Start development server
```bash
npm start
```

The application will open at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/
│   ├── Graph/
│   │   ├── GraphCanvas.tsx          # Main graph visualization
│   │   └── CustomNodes/
│   │       ├── HighScoreNode.tsx    # Popular user node
│   │       └── LowScoreNode.tsx     # Regular user node
│   ├── Sidebar/
│   │   └── Sidebar.tsx              # Hobby management sidebar
│   ├── UserManagement/
│   │   ├── UserManagementPanel.tsx  # User CRUD operations
│   │   └── ConfirmDialog.tsx        # Confirmation dialogs
│   ├── Layout/
│   │   └── TopBar.tsx               # Header with stats
│   ├── Loading/
│   │   ├── LoadingUI.tsx            # Loading spinner & error UI
│   │   └── ErrorBoundary.tsx        # React error boundary
│   └── Notifications/
│       └── NotificationContainer.tsx # Toast notifications
├── context/
│   ├── GraphContext.tsx             # Graph state management
│   └── NotificationContext.tsx      # Notification management
├── services/
│   └── api.ts                       # API client
├── hooks/
│   └── index.ts                     # Custom hooks (useDebounce, useLocalStorage, useAsync)
├── utils/
│   └── helpers.ts                   # Utility functions
├── types/
│   └── index.ts                     # TypeScript type definitions
├── App.tsx                          # Main app component
├── index.tsx                        # Entry point with providers
└── index.css                        # Global styles & Tailwind directives
```

## 🎯 Key Components

### GraphCanvas
- Displays interactive React Flow graph
- Handles node selection and connection
- Supports drag-and-drop hobby addition
- Shows real-time graph statistics

### Sidebar
- Lists all hobbies with usage count
- Search functionality for hobbies
- Add new hobbies for selected users
- Drag hobbies onto users to add them

### UserManagementPanel
- Create new users with hobbies
- Edit existing user details
- Delete users (with safeguards)
- View all users with their stats

### TopBar
- Refresh data from backend
- Toggle sidebar visibility
- Display active user count and connections

## 🔄 Data Flow

1. **Load Data**: On app mount, fetch all users and relationships from backend
2. **Display**: Render users as nodes and relationships as edges
3. **Interact**: User can:
   - Drag hobbies onto users
   - Create/edit/delete users
   - Connect/disconnect users
4. **Sync**: Changes are saved to backend immediately
5. **Update**: UI updates in real-time with animations

## 🎨 Design System

### Colors
- **Primary**: Blue (#3b82f6)
- **Secondary**: Indigo (#6366f1)
- **Success**: Green (#22c55e)
- **Error**: Red (#ef4444)
- **Warning**: Yellow (#eab308)

### Animations
- **Entrance**: Fade + Scale
- **Exit**: Fade + Scale
- **Score Bar**: Width animation
- **Loading**: Infinite rotation
- **Notifications**: Slide in from right

## 🔌 API Integration

The frontend connects to the backend API at:
```
http://localhost:8080/api
```

### Endpoints Used:
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `POST /api/users/{id}/link` - Link users (friendship)
- `DELETE /api/users/{id}/unlink` - Unlink users
- `GET /api/graph` - Get full graph data (users + relationships)

## 🚦 Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run linter (if configured)
npm run lint
```

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
# Kill process on port 3000
# Windows: taskkill /PID <PID> /F
# macOS/Linux: lsof -ti:3000 | xargs kill -9
```

### CORS errors
- Ensure backend has CORS enabled (should be at port 8080)
- Check `REACT_APP_API_URL` in `.env` matches backend URL

### Node dependencies issues
```bash
# Clear cache and reinstall
rm -r node_modules package-lock.json
npm install --legacy-peer-deps
```

### Build errors
```bash
# Ensure TypeScript is correctly configured
npm run build -- --verbose
```

## 📦 Dependencies Overview

### Core
- **react** (18.2.0): UI library
- **react-dom**: DOM rendering
- **reactflow** (11.11.4): Graph visualization
- **typescript**: Static typing

### Styling
- **tailwindcss**: Utility-first CSS
- **framer-motion** (10.16.16): Animations

### State & Data
- **zustand** (4.4.1): State management (optional, can replace Context)
- **axios**: HTTP client
- **@tanstack/react-query**: Data fetching & caching

### UI Components
- **@headlessui/react**: Unstyled components
- **@heroicons/react** (2.0.18): Icon library
- **react-hot-toast**: Toast notifications
- **react-router-dom**: Routing (for future expansion)

### Development
- **react-scripts**: Build tools
- **@types/***: TypeScript definitions

## 🔒 Error Handling

### Error Boundary
Catches React component errors and displays fallback UI

### Toast Notifications
- Success: Green checkmark
- Error: Red X icon
- Warning: Yellow exclamation
- Info: Blue information icon

### API Error Handling
- Catches network errors
- Displays user-friendly messages
- Prevents state corruption

## 🎓 Learning Path

1. Start with `App.tsx` - main component structure
2. Review `GraphContext.tsx` - state management
3. Explore `GraphCanvas.tsx` - graph visualization
4. Check `UserManagementPanel.tsx` - CRUD operations
5. Study custom nodes in `CustomNodes/`

## 🚀 Performance Tips

1. **Lazy Loading**: Load users incrementally for large datasets
2. **Debouncing**: Already implemented for hobby updates
3. **Memoization**: Use React.memo for heavy components
4. **Virtual Scrolling**: Consider for very large user lists

## 📚 Additional Resources

- [React Flow Documentation](https://reactflow.dev/)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Hooks](https://react.dev/reference/react)

## 📝 License

This project is part of the User Relationships system.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review component documentation in comments
3. Check browser console for detailed errors
4. Verify backend is running and accessible

