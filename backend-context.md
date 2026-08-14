# Backend Context

## 1. Project Stack & Overview
- **Framework**: Express.js on Node.js
- **Database**: MySQL (using `mysql2` Promise-based connection pool).
- **Authentication**: JWT (JSON Web Tokens) with `bcrypt` for password hashing.
- **External Integration**: Open Library Search/Works API.
- **Role/Permissions**: `ADMIN` role only (No RBAC complexity).
- **Primary Goal**: A book metadata/catalog import system allowing admins to import books, subjects, authors, and languages into a local MySQL database securely and efficiently.

## 2. Core Architecture & Request Flow
The backend uses a standard MVC + Services architectural pattern:
- **Routes (`src/routes/`)**: Map external HTTP requests to specific controller functions.
- **Controllers (`src/controllers/`)**: Handle HTTP concerns (req/res), parse inputs, validate payloads, invoke the appropriate service(s), and format the final JSON response.
- **Services (`src/services/`)**: Contain the core business logic (e.g., executing the batch import flow, mapping data, orchestrating different models).
- **Models (`src/models/`)**: Directly interface with the MySQL database using raw SQL queries to insert, find, and update records.

**Typical Flow**:
`Route` → `Controller` → `Service` → `Model` → `Database`

## 3. Strict Coding Conventions
When writing or modifying code in this project, these conventions are **mandatory**:
1. **No Callback-Based DB Models**: Do not use `db.query(sql, params, callback)`. 
2. **No Manual Promises**: Do not wrap queries in `new Promise((resolve, reject) => { ... })`.
3. **Async/Await Only**: The `mysql2` connection exposes a `.promise()` pool. Models MUST use modern `async/await` syntax:
   `const [rows] = await db.query(sql, params);`
4. **Separation of Concerns**: 
   - Controllers handle HTTP (never direct DB queries).
   - Services handle business logic (never direct HTTP responses).
   - Models handle database operations (never business logic).
   - The Open Library service `openLibraryService.js` strictly handles Open Library API interactions.
5. **Multiple Authors & Relations**: A single book can have multiple authors/subjects. The system must support iterating over external arrays and utilizing junction tables.

## 4. Current Authentication Flow
- **Login (`/auth/login`)**: Validates credentials via `userModel.findByEmail`, verifies password using `bcrypt`, generates an Access Token and a Refresh Token, stores the Refresh Token in the DB (`refreshTokenModel.saveRefreshToken` and updates user with `userModel.updateRefreshTokenId`), and returns cookies/JSON.
- **Refresh (`/auth/refresh`)**: Validates the provided refresh token, rotates it (issues a new access/refresh pair), updates the DB, and revokes the old one.
- **Logout (`/auth/logout`)**: Clears cookies and deletes the refresh token from the database.
- **Middleware (`protect`)**: Verifies the JWT Access Token before allowing access to protected routes (like imports).

## 5. Current Models & Relationships
- **users**: Stores the `ADMIN` login credentials and refresh token ID.
- **refresh_tokens**: Stores active JWT refresh tokens.
- **books**: The primary entity imported from Open Library (`open_library_work_key` is the unique identifier).
- **authors**: Stores author names (`open_library_author_key` is unique).
- **book_authors**: Junction table connecting books to authors (Many-to-Many).
- **subjects**: Stores normalized subject/category names.
- **book_subjects**: Junction table connecting books to subjects (Many-to-Many).
- **languages**: Stores language codes.
- **book_languages**: Junction table connecting books to languages (Many-to-Many).
- **import_jobs**: Tracks the status (running, completed, failed) and counters (processed, successful) of batch imports.
- **import_job_logs**: Stores individual granular logs and errors for a specific `import_job`.

## 6. Open Library Integration Flow
Located in `src/services/openLibrary/`:
- **Client (`openLibraryClient.js`)**: A wrapper utilizing `axios` or `fetch` configured with the Open Library base URL.
- **Service (`openLibraryService.js`)**: 
  - `searchBooks(title, author, limit, offset)`: Queries `/search.json`.
  - `getWork(workKey)`: Fetches specific work metadata from `/works/{key}.json`.
  - `getAuthor(authorKey)`: Fetches author metadata from `/authors/{key}.json`.

## 7. API Endpoints
- **POST** `/api/auth/login`
- **POST** `/api/auth/refresh`
- **POST** `/api/auth/logout`
- **GET** `/api/books/search`
- **GET** `/api/books/catalog`
- **GET** `/api/books/work/:workKey`
- **GET** `/api/books/work/:workKey/editions`
- **POST** `/api/books/import/:workKey`
- **POST** `/api/books/import/batch`
- **GET** `/api/books/import/jobs`
- **GET** `/api/books/import/jobs/:jobId/logs`
- **GET** `/api/dashboard/stats`

## 8. Import Flows

### Single Book Import (`POST /api/books/import/:workKey`)
1. Creates an `import_job` entry to track the request.
2. `bookImportService.importBook` calls Open Library for the specific work.
3. Checks if the `open_library_work_key` already exists via `bookModel`. If yes, returns duplicate.
4. If new, inserts the book into `books`.
5. Iterates through the `authors` array from Open Library, fetches exact author details, checks existence, inserts if missing, and connects via `book_authors`.
6. Iterates through `subjects` and `languages`, checking existence, inserting if missing, and connecting via `book_subjects` and `book_languages`.
7. Updates the `import_job` status and counters.

### Batch Import System (`POST /api/books/import/batch`)
1. Reaches `importBatch` controller which extracts search query (`title`, `author`, `limit`, `offset`).
2. Delegates to `importJobService.startBatchImport()`.
3. The batch system fetches search results from Open Library, loops through the returned `docs`, and sequentially processes each work using the same normalization logic as the single book import, while logging progress and errors to `import_jobs` and `import_job_logs`.

### Import Jobs Monitor (`GET /api/books/import/jobs` & `/logs`)
- `GET /jobs`: Returns a paginated list of all import jobs, their statuses, and processing counters.
- `GET /jobs/:jobId/logs`: Returns all log entries (info, warning, error) generated during the execution of a specific job.
