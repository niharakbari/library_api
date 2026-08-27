# Library Management System

## Overview
This is a full-stack library management system API and admin dashboard. The platform handles standard library operations including cataloging books, importing book data from external sources like the Open Library API, managing library members, tracking book issues and returns, and detecting overdue checkouts. It provides real-time updates via WebSockets and extensive data quality reporting.

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Frontend**: React, Vite, Lucide Icons
- **Real-time**: Socket.IO
- **Authentication**: JWT (HttpOnly cookies)

## Project Structure
```text
.
├── backend/                  # Express API server
│   ├── src/
│   │   ├── config/           # Database and environment configurations
│   │   ├── controllers/      # Route handlers and business logic
│   │   ├── middlewares/      # JWT auth and error handling
│   │   ├── models/           # MySQL database queries
│   │   ├── routes/           # Express route definitions
│   │   ├── services/         # External integrations (e.g. Open Library API)
│   │   └── server.js         # Entry point
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI elements
│   │   ├── pages/            # View components (Dashboard, MyLibrary, etc.)
│   │   ├── utils/            # Helper functions for export and formatting
│   │   └── App.jsx           # Main React component routing
├── database/                 # SQL schemas and migration scripts
│   └── schema.sql            # Core database table definitions
└── README.md                 # Project documentation
```

## Database Setup
1. Ensure MySQL is installed and running on your local machine.
2. Create a new database for the project (e.g., `library_db`).
3. Run the schema script to initialize all required tables:
   ```bash
   mysql -u root -p library_db < database/schema.sql
   ```
4. Verify that tables for users, members, books, authors, subjects, and issues have been created successfully.

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd library-api-project
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the `backend/` directory using the provided examples. You will need:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=library_db
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   ```

4. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Run the Application**
   Open two terminal windows:
   
   Terminal 1 (Backend):
   ```bash
   cd backend
   npm run dev
   ```
   
   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```

## API Endpoints

### Authentication (/api/auth)
- `POST /api/auth/login` - Authenticate user and receive tokens
- `GET /api/auth/me` - Get current authenticated user profile
- `POST /api/auth/refresh` - Refresh access token via HttpOnly cookie
- `POST /api/auth/logout` - Invalidate tokens and log out

### Dashboard (/api/dashboard)
- `GET /api/dashboard/stats` - Retrieve aggregate statistics for the admin dashboard

### Books (/api/books)
- `GET /api/books/catalog` - Get paginated library catalog
- `GET /api/books/search` - Search books by text
- `GET /api/books/work/:workKey` - Get specific book details
- `GET /api/books/work/:workKey/editions` - Get editions for a specific work
- `POST /api/books/existing-works` - Check existence of multiple works
- `GET /api/books/languages` - List all book languages
- `GET /api/books/subjects` - List all book subjects
- `GET /api/books/authors` - List all authors
- `POST /api/books/author/:id` - Update an author record
- `POST /api/books/publishYear/:id` - Update the publish year for a book
- `GET /api/books/:bookId/review` - Get reviews for a specific book
- `POST /api/books/:bookId/review` - Add a review
- `PATCH /api/books/:bookId/review` - Update a review
- `DELETE /api/books/delete/:id` - Delete a specific book
- `DELETE /api/books/clear` - Clear all books from the library (with transaction safety)

### Import (/api/import)
- `POST /api/import/:workKey` - Import a single book from external catalog
- `POST /api/import/batch` - Import multiple books
- `POST /api/import/selected` - Import specific selected books
- `GET /api/import/jobs` - View history of import jobs
- `GET /api/import/jobs/:jobId` - View specific job status
- `GET /api/import/jobs/:jobId/logs` - View system logs for an import job
- `GET /api/import/jobs/:jobId/items` - View individual items processed in a job

### Data Quality & Reporting
- `GET /api/data-quality` - Identify records with missing or malformed fields
- `GET /api/report/report` - Generate summary reporting data
- `GET /api/export/books` - Export book catalog as CSV
- `GET /api/export/authors` - Export authors as CSV
- `GET /api/export/subjects` - Export subjects as CSV
- `GET /api/export/languages` - Export languages as CSV
- `GET /api/export/books/author/:authorId` - Export all books by a specific author
- `GET /api/export/books/subject/:subjectId` - Export all books under a specific subject

### Inventory & Circulation (/api/inventory)
- `GET /api/inventory/author` - Search inventory by author
- `GET /api/inventory/language` - Search inventory by language
- `GET /api/inventory/title` - Search inventory by title
- `GET /api/inventory/subject` - Search inventory by subject
