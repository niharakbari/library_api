# Frontend Context

## Stack & Architecture
- **Framework**: React 19 (Vite-powered, ES Modules setup)
- **Routing**: `react-router-dom` v7
- **Styling**: Vanilla CSS (`src/App.css`, component-level CSS)
- **State Management**: React state hooks (`useState`, `useEffect`)
- **API Client**: `axios`
- **Icons**: `lucide-react`
- **Assets**: Static SVGs and PNG assets located in `src/assets`

## Folder Structure
- `frontend/src/`
  - `components/Layout/` - `AdminLayout.jsx` and CSS for the sidebar navigation shell.
  - `pages/` - Page components (`Login.jsx`, `Dashboard.jsx`, `BookSearch.jsx`, `BookDetails.jsx`, `ImportJobs.jsx`, `JobLogs.jsx`) and their scoped CSS.
  - `App.jsx` - App entry routing definitions.
  - `index.css` - Global and reset styles.

## Authentication & API Integration
- **Auth Flow**: Uses backend `/auth/login` and `/auth/logout`. Access tokens are stored in `localStorage` alongside basic user info, and a `ProtectedRoute` wrapper secures inner routes.
- **API Integration**: Axios configured globally with `withCredentials: true` and defaults to `localhost:3000`.

## UI/Design Decisions
- **Color Palette**: 
  - Background: `#F7F7F5`
  - Primary yellow: `#E8C547`
  - Dark text: `#252525`
  - Secondary text: `#737373`
  - Borders: `#E5E5E5`
  - Cards: `#FFFFFF`
- Clean, spacious, library-appropriate admin layout featuring a fixed left sidebar and a flexible main content area.

## Implemented Features
- **Admin Login**: Form validation, password visibility toggle, error handling.
- **Admin Layout**: Persistent sidebar navigation with active route highlighting and logout.
- **Dashboard**: A 3-tier Library Management overview displaying live statistics (books, authors, subjects, languages), recent catalog/job activity, and a polished feature hub.
- **My Library**: Displays a grid of locally imported books fetched from the backend `/catalog` endpoint.
- **Book Search**: Queries Open Library via backend, supports Single Book Import and initiating a Batch Import job. Now includes explicit warnings for Duplicate imports.
- **Book Details & Editions**: Views metadata and editions for a specific work key fetched through the backend.
- **Import Jobs Monitor**: Displays a paginated table of backend import jobs, their status, progress bars, and duplicate record counts.
- **Job Logs**: A terminal-styled view of granular logs (info/warning/error) for a specific job ID.

## Known Issues & Backlog
- Hardcoded `http://localhost:3000` base URL in Axios; needs `.env` configuration for production.
- Access token stored in `localStorage`.
