# Frontend Context

## Stack & Architecture
- **Framework**: React 19 (Vite-powered, ES Modules setup)
- **Routing**: `react-router-dom` v7
- **Styling**: Vanilla CSS (`src/App.css`, `src/index.css`, component-level CSS)
- **State Management**: React state hooks (`useState`)
- **API Client**: `axios`
- **Icons**: `lucide-react` and SVG sprite sheet (`public/icons.svg`)
- **Assets**: Static SVGs and PNG assets located in `src/assets`

## Folder Structure
- `frontend/src/`
  - `assets/` - Image and vector graphic files
  - `pages/` - Page components (e.g., `Login.jsx`, `Dashboard.jsx`, `Login.css`)
  - `App.css` - General component styles
  - `App.jsx` - App entry routing definitions
  - `index.css` - Global and reset styles
  - `main.jsx` - App entry point
- `frontend/public/` - Static assets served directly

## Authentication & API Integration
- **Auth Flow**: Uses backend `/auth/login` and `/auth/logout`. Access tokens are stored in `localStorage` alongside basic user info, and `ProtectedRoute` wrapper secures routes.
- **API Integration**: Axios configured globally with `withCredentials: true` and defaults to `localhost:3000`.

## UI/Design Decisions
- Admin login page is minimal, professional, with a central white card on a light gray background (#F8F8F8) using #FFDD00 (primary yellow) strictly for the login button to prevent eye strain.
- Uses `lucide-react` for simple consistent iconography (e.g. eye toggle, book logo).

## Implemented Features
- **Admin Login Page**: Form validation, password visibility toggle, error handling, loading states, API integration.
- **Client-Side Routing**: Setup using `react-router-dom` with a `ProtectedRoute` for authenticated views.
- **Dashboard Placeholder**: Simple view with logout functionality.

## Known Issues & Backlog
- Hardcoded `http://localhost:3000` base URL in Axios; needs `.env` configuration for production.
- Access token is currently stored in `localStorage` for simplicity. Depending on security requirements, consider more robust state management.
