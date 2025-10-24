# AuraCare Upload

A SvelteKit application for uploading and managing medical photos with metadata to DigitalOcean Spaces, featuring Lucia authentication.

## Features

- **User Authentication**: Secure authentication with Lucia (session-based)
- **Photo Upload**: Upload medical photos to DigitalOcean Spaces
- **Metadata Management**: Store age, gender, symptoms, and additional notes
- **Photo Gallery**: View and manage uploaded photos
- **Protected Routes**: All routes require authentication

## Tech Stack

- **Framework**: SvelteKit 5 (with Svelte 5 runes)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Lucia (custom implementation with Oslo utilities)
- **Storage**: DigitalOcean Spaces (S3-compatible)
- **Styling**: Tailwind CSS 4
- **Password Hashing**: Argon2

## Prerequisites

- Node.js (v18 or higher recommended)
- PostgreSQL database
- DigitalOcean Spaces account with:
  - Access Key
  - Secret Key
  - Bucket created (e.g., `auracare`)

## Setup

### 1. Install Dependencies

```sh
yarn install
# or
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```sh
cp .env.example .env
```

Update `.env` with your actual values:

```env
# Database
DATABASE_URL="postgres://user:password@host:port/db-name"

# DigitalOcean Spaces
DO_SPACES_KEY="your-spaces-access-key"
DO_SPACES_SECRET="your-spaces-secret-key"
DO_SPACES_ENDPOINT="https://lon1.digitaloceanspaces.com"
DO_SPACES_REGION="lon1"
DO_SPACES_BUCKET="auracare"
```

### 3. Set Up Database

Run the database migration:

```sh
yarn db:push
# or
npm run db:push
```

This will create the following tables:
- `user` - User accounts with username, password hash, and location
- `session` - Authentication sessions
- `photo` - Photo metadata with links to DigitalOcean Spaces

### 4. Start Development Server

```sh
yarn dev
# or
npm run dev
```

Visit `http://localhost:5173` to access the application.

## Database Schema

### User Table
- `id` (text, primary key)
- `username` (text, unique, not null)
- `password_hash` (text, not null)
- `age` (integer, nullable)
- `location` (text, nullable)

### Session Table
- `id` (text, primary key)
- `user_id` (text, foreign key to user)
- `expires_at` (timestamp with timezone)

### Photo Table
- `id` (serial, primary key)
- `user_id` (text, foreign key to user)
- `image_url` (text, not null) - URL to DigitalOcean Spaces
- `age` (integer, not null)
- `gender` (text, not null)
- `symptoms` (text[], not null) - Array of symptom strings
- `other` (text, nullable) - Additional notes
- `uploaded_at` (timestamp with timezone, default now)

## API Endpoints

### Authentication
- `GET /login` - Login page
- `POST /login` - Login action
- `GET /register` - Registration page
- `POST /register` - Registration action (includes location field)
- `POST /logout` - Logout action

### Photos
- `POST /api/photos` - Upload a photo with metadata
  - Body: FormData with `file`, `age`, `gender`, `symptoms` (JSON array), `other`
- `GET /api/photos` - List all photos for authenticated user
- `GET /api/photos/[id]` - Get specific photo details
- `DELETE /api/photos/[id]` - Delete a photo (removes from both DB and DigitalOcean Spaces)

## Project Structure

```
src/
├── lib/
│   └── server/
│       ├── db/
│       │   ├── index.ts         # Database client
│       │   └── schema.ts        # Drizzle schema definitions
│       ├── auth.ts              # Lucia authentication logic
│       ├── guards.ts            # Route guards (requireAuth)
│       └── spaces.ts            # DigitalOcean Spaces utilities
├── routes/
│   ├── api/
│   │   └── photos/
│   │       ├── +server.ts       # POST (upload) & GET (list) endpoints
│   │       └── [id]/+server.ts  # GET & DELETE for specific photo
│   ├── login/                   # Login page & actions
│   ├── register/                # Register page & actions (with location)
│   ├── logout/                  # Logout action
│   └── +page.svelte             # Protected home page with upload UI
└── hooks.server.ts              # Session validation middleware
```

## Usage

### Register a New User
1. Visit `/register`
2. Enter username, password, and location (optional)
3. Click "Register"

### Login
1. Visit `/login`
2. Enter your credentials
3. Click "Sign in"

### Upload a Photo
1. After logging in, you'll see the upload form
2. Select an image file
3. Fill in:
   - Age
   - Gender (male/female/other)
   - Symptoms (comma-separated, e.g., "headache, fever, cough")
   - Other notes (optional)
4. Click "Upload Photo"

The photo will be uploaded to DigitalOcean Spaces and metadata saved to the database.

### View & Manage Photos
- All your uploaded photos appear on the right side of the home page
- Each photo displays:
  - Image preview
  - Age, gender, symptoms, and notes
  - Upload timestamp
- Click "Delete" to remove a photo (removes from both storage and database)

## Development Scripts

```sh
yarn dev          # Start development server
yarn build        # Build for production
yarn preview      # Preview production build
yarn db:generate  # Generate migration files
yarn db:push      # Push schema changes to database
yarn db:studio    # Open Drizzle Studio (database GUI)
yarn check        # Type-check the project
yarn format       # Format code with Prettier
```

## Security Features

- Passwords hashed with Argon2 (memory-hard algorithm)
- Session-based authentication with 30-day expiration
- Sessions auto-renewed when 15+ days remaining
- CSRF protection via SvelteKit form actions
- Protected routes require authentication
- Photos only accessible/deletable by owner

## DigitalOcean Spaces Configuration

Files are uploaded with:
- Public read access (`ACL: 'public-read'`)
- Unique file paths: `uploads/{userId}/{timestamp}-{uuid}.{extension}`
- Automatic content-type detection

## Production Deployment

### Deploying to DigitalOcean App Platform

The application includes configuration files for easy deployment to DigitalOcean App Platform:

**1. Prerequisites**
- GitHub repository with your code
- DigitalOcean account
- PostgreSQL database (can use DO Managed Database)
- DigitalOcean Spaces bucket

**2. Configure Environment Variables**

In the DigitalOcean App Platform dashboard, set these environment variables:

```
DATABASE_URL=postgres://user:password@host:port/db-name
DO_SPACES_KEY=your-spaces-access-key
DO_SPACES_SECRET=your-spaces-secret-key
DO_SPACES_ENDPOINT=https://lon1.digitaloceanspaces.com
DO_SPACES_REGION=lon1
DO_SPACES_BUCKET=auracare
NODE_ENV=production
PORT=8080
HOST=0.0.0.0
```

**3. Deploy via App Spec (Recommended)**

The `.do/app.yaml` file contains the complete app specification. In DigitalOcean:

1. Create a new App
2. Connect your GitHub repository
3. Choose "Edit your App Spec"
4. Paste the contents of `.do/app.yaml`
5. Update the `github` section with your repository details
6. Add your secret environment variables (DATABASE_URL, etc.)
7. Click "Create Resources"

**4. Manual Deployment**

Alternatively, configure manually:
- **Build Command**: `yarn build`
- **Run Command**: `yarn start` or `node build/index.js`
- **Port**: 8080
- **Health Check**: HTTP path `/` with 60s initial delay

**5. Database Migration**

After deployment, run migrations using the App Platform console:

```sh
yarn db:push
```

Or use the DigitalOcean CLI:
```sh
doctl apps create-deployment <app-id> --wait
```

### Other Platforms

For other hosting platforms (Heroku, Railway, etc.):

1. Build the application:
```sh
yarn build
```

2. Set environment variables on your hosting platform

3. Run database migrations:
```sh
yarn db:push
```

4. Start the production server:
```sh
yarn start
```

The `Procfile` is included for Heroku-compatible platforms.


