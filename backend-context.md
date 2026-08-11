# Backend Context

## Stack & Architecture
- **Framework**: Express 5.x
- **Runtime**: Node.js
- **Database**: MySQL (using `mysql2` pool)
- **Real-time Communication**: `socket.io`
- **Logging**: `winston`
- **Security & Utilities**: `bcrypt` (password hashing), `jsonwebtoken` (auth), `cookie-parser`, `express-validator`

## Folder Structure
- `backend/src/`
  - `config/` - App configurations, database connections, and logger settings
  - `controllers/` - Route handler implementations (e.g. `authController.js`)
  - `middlewares/` - Express middlewares (auth protection, validation, error handling)
  - `models/` - Data models interfacing with MySQL (e.g. `userModel.js`, `refreshTokenModel.js`)
  - `routes/` - API route entry points (e.g. `authRoutes.js`)
  - `services/` - Business logic handlers (e.g. `authService.js`)
  - `utils/` - Global helpers and custom error classes (`jwt.js`, `asyncHandler.js`, `AppError.js`)
  - `validations/` - Input validations using `express-validator`
  - `app.js` - App initialization (CORS, parsing, mounting routes, error handling)
  - `server.js` - HTTP & WebSockets startup entry point

## Database Schema & Models
- **`users` Table**:
  - Columns: `id`, `name`, `email`, `password`, `role` (VIEWER/ADMIN), `refresh_token_id`, `created_at`, `updated_at`

## APIs & Routes
- **/auth** (`src/routes/authRoutes.js`)
  - `POST /login` - Log in user (validated, returns access token/cookie, updates refresh token)
  - `GET /me` - Get current user profile (requires validation middleware)
  - `POST /refresh` - Rotate refresh token to issue new access token
  - `POST /logout` - Log out user and revoke active tokens

## Implemented Features
- Secure login and registration wrapper with auto-assigned `VIEWER` role.
- JWT Access and Refresh token lifecycle (refresh token rotation).
- Global express error handler middleware.
- Socket.io connection setup with rooms configured for `workshop_<id>` updates.

## Known Issues & Backlog
- Database schema migration scripts are not explicitly visible in standard files (requires active database instance setup or SQL schemas).
