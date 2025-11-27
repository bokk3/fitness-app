# Authentication Integration Documentation

This document details the integration of **Better Auth** into the Fitness Tracking App.

## Overview

The application uses [Better Auth](https://www.better-auth.com/) for user authentication and session management. It supports:

- Email/Password authentication
- Social providers (Google, GitHub)
- SQLite database adapter

## Database Schema Changes

The database schema has been updated to support Better Auth and UUID-based user IDs.

### New Tables

The following tables were added to manage authentication:

- **`user`**: Stores user profile data (id, name, email, image).
- **`session`**: Manages active user sessions.
- **`account`**: Links social login accounts (OAuth) to users.
- **`verification`**: Stores verification tokens.

### Schema Updates

Existing application tables were modified to reference the new `user` table:

- **`user_id` Type Change**: Changed from `INTEGER` to `TEXT` to support Better Auth's UUIDs.
- **Foreign Keys**: Updated to reference `user(id)`.

Affected tables:

- `workouts`
- `exercises`
- `goals`
- `body_measurements`
- `nutrition_logs`
- `nutrition_foods`

## API Security

API routes have been secured to ensure data privacy and user scoping.

### Authentication Helper

A helper function is used in API routes to retrieve the current session:

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user;
}
```

### Route Protection

All protected routes implement the following pattern:

1.  **Verify User**: Check if a user session exists.
2.  **Unauthorized Response**: Return `401 Unauthorized` if no user is found.
3.  **User Scoping**: Use `user.id` to filter database queries.

#### Example (Workouts)

```typescript
export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Query filtered by user.id
  const workouts = db
    .prepare("SELECT * FROM workouts WHERE user_id = ? ...")
    .all(user.id);
  // ...
}
```

### Data Scoping Strategy

- **Private Data** (Workouts, Goals, Measurements, Logs): Strictly filtered by `user_id`. Users can only see their own data.
- **Shared/Public Data** (Exercises, Foods):
  - Queries return **Default items** (`is_custom = 0`) **AND** **User's custom items** (`user_id = ?`).
  - Example Query:
    ```sql
    SELECT * FROM exercises
    WHERE (is_custom = 0 OR user_id = ?)
    AND ...
    ```

## Configuration

The auth configuration is located in `lib/auth.ts`:

- **Adapter**: `better-sqlite3`
- **Providers**:
  - `emailAndPassword`
  - `google` (Requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
  - `github` (Requires `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`)

## Environment Variables

Ensure the following environment variables are set for social login:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
BETTER_AUTH_SECRET=... # Recommended for security
BETTER_AUTH_URL=http://localhost:3000 # Base URL of the app
```
