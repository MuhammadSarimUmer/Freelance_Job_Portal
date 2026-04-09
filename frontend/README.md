# Freelance Portal — Backend API Reference

**Base URL:** `http://localhost:3000/api/v1`

All responses follow this shape:

```json
{
    "success": true | false,
    "message": "...",
    "data": { ... },
    "token": "...",
    "errors": [ ... ]
}
```

**Authentication:** All protected routes require:

```
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication

### `POST /auth/register`

Creates a new user account with either a Developer or Client profile in a single atomic transaction. Returns a JWT token immediately so the user is logged in after registration — no need to call `/login` separately.

**Why it exists:** Single entry point for onboarding. The `role` field determines which profile sub-record is created (developer or client). Phone number is optional at registration and can be added later via the profile update endpoint.

**Request Body:**

```json
{
    "fullName": "Tony Stark",
    "email": "tony@stark.com",
    "password": "securepass123",
    "role": "DEVELOPER",
    "phoneNumber": "+12025551234",
    "country": "USA"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `fullName` | string | yes | |
| `email` | string | yes | Must be unique |
| `password` | string | yes | Min 8 characters |
| `role` | string | yes | `"DEVELOPER"` or `"CLIENT"` |
| `phoneNumber` | string | no | Any valid mobile format |
| `country` | string | conditional | Required when `role` is `"CLIENT"` |

**Response `201`:**

```json
{
    "success": true,
    "token": "eyJhbGci...",
    "user": {
        "userID": "uuid",
        "fullName": "Tony Stark",
        "email": "tony@stark.com",
        "phoneNumber": "+12025551234",
        "registrationDate": "2026-04-10T...",
        "accountStatus": "ACTIVE"
    }
}
```

**Error Responses:**

| Status | Reason |
|--------|--------|
| `400` | Validation failed (bad email, short password, missing fields) |
| `409` | Email already in use |

---

### `POST /auth/login`

Authenticates a user by email and password. Returns a JWT token (valid for 24 hours) and the full user object including their developer or client profile.

**Why it exists:** Primary login flow. The response includes the user's role-specific profile so the frontend can immediately render the correct dashboard without an extra API call.

**Request Body:**

```json
{
    "email": "tony@stark.com",
    "password": "securepass123"
}
```

**Response `200`:**

```json
{
    "success": true,
    "token": "eyJhbGci...",
    "user": {
        "userID": "uuid",
        "fullName": "Tony Stark",
        "email": "tony@stark.com",
        "phoneNumber": "+12025551234",
        "registrationDate": "2026-04-10T...",
        "accountStatus": "ACTIVE",
        "developer": {
            "developerID": "uuid",
            "experienceYears": 0,
            "hourlyRate": "0.00",
            "portfolioURL": null,
            "availabilityStatus": "AVAILABLE"
        },
        "client": null
    }
}
```

**Error Responses:**

| Status | Reason |
|--------|--------|
| `400` | Validation failed |
| `401` | Wrong email/password, or account not active |

---

### `GET /auth/me`

Returns the currently authenticated user's full profile. Requires a valid JWT token.

**Why it exists:** Used on app startup / page refresh to verify the session is still valid and to hydrate the frontend's user state. Also useful after actions that might change the user's profile (though the update endpoints return updated data too).

**Request Body:** None

**Response `200`:**

```json
{
    "success": true,
    "user": {
        "userID": "uuid",
        "fullName": "Tony Stark",
        "email": "tony@stark.com",
        "phoneNumber": "+12025551234",
        "registrationDate": "2026-04-10T...",
        "accountStatus": "ACTIVE",
        "developer": {
            "developerID": "uuid",
            "experienceYears": 12,
            "hourlyRate": "150.00",
            "portfolioURL": "https://tonystark.dev",
            "availabilityStatus": "AVAILABLE",
            "knownTechs": [
                {
                    "techID": "uuid",
                    "proficiencyLevel": "EXPERT",
                    "yearsExperience": 5,
                    "tech": {
                        "techID": "uuid",
                        "techName": "React",
                        "category": "Frontend",
                        "version": "18"
                    }
                }
            ]
        },
        "client": null
    }
}
```

**Error Responses:**

| Status | Reason |
|--------|--------|
| `401` | Missing or expired token |
| `404` | User no longer exists |

---

### `POST /auth/refresh`

Issues a new JWT token using the current valid token. The new token has a fresh 24-hour expiry.

**Why it exists:** Prevents forcing the user to log in again when their token is about to expire. Call this periodically (e.g. every 12 hours) or when the frontend detects the token is nearing expiry. The role is re-verified from the database so the new token always reflects the current state.

**Request Body:** None

**Response `200`:**

```json
{
    "success": true,
    "token": "eyJhbGci... (new token)"
}
```

**Error Responses:**

| Status | Reason |
|--------|--------|
| `401` | Token expired / invalid, or account is no longer active |
| `403` | User has no assigned role |

---

### `POST /auth/logout`

Acknowledges logout on the server side.

**Why it exists:** Provides a clean logout endpoint for the frontend. Currently, since JWTs are stateless, the frontend should discard the token from local storage. Token blacklisting is planned for a future release.

**Request Body:** None

**Response `200`:**

```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

---

### `POST /auth/forgot-password`

Initiates the password reset flow by generating a time-limited reset token (15 min expiry).

**Why it exists:** Allows users who forgot their password to reset it. For security, the response always returns `200` regardless of whether the email exists — this prevents email enumeration attacks. In development mode (`NODE_ENV=development`), the response includes `devToken` for testing.

**Request Body:**

```json
{
    "email": "tony@stark.com"
}
```

**Response `200`:**

```json
{
    "success": true,
    "message": "If that email exists, a reset link has been sent"
}
```

Development mode response:

```json
{
    "success": true,
    "message": "Reset link sent",
    "devToken": "eyJhbGci..."
}
```

---

## 2. Developer Profiles

### `GET /profiles/developers`

Returns a list of all developers. Supports optional query filters.

**Why it exists:** Powers the developer discovery / search page where clients browse available developers. Includes each developer's tech stack and user info.

**Query Parameters:**

| Param | Type | Notes |
|-------|------|-------|
| `status` | string | Filter by `AVAILABLE`, `BUSY`, or `UNAVAILABLE` |
| `minExperience` | integer | Filter devs with at least this many years of experience |

**Examples:**

```
GET /profiles/developers
GET /profiles/developers?status=AVAILABLE
GET /profiles/developers?minExperience=3
GET /profiles/developers?status=AVAILABLE&minExperience=3
```

**Response `200`:**

```json
{
    "success": true,
    "data": [
        {
            "developerID": "uuid",
            "userID": "uuid",
            "experienceYears": 12,
            "hourlyRate": "150.00",
            "portfolioURL": "https://tonystark.dev",
            "availabilityStatus": "AVAILABLE",
            "user": {
                "fullName": "Tony Stark",
                "email": "tony@stark.com"
            },
            "knownTechs": [ ... ]
        }
    ]
}
```

**Error Responses:**

| Status | Reason |
|--------|--------|
| `400` | Invalid `status` enum or non-numeric `minExperience` |
| `401` | Not authenticated |

---

### `GET /profiles/developers/:id`

Returns a single developer profile by their `developerID`.

**Why it exists:** Powers the developer detail / profile page when a client clicks on a developer card from the listing.

**Response `200`:**

```json
{
    "success": true,
    "data": {
        "developerID": "uuid",
        "experienceYears": 12,
        "hourlyRate": "150.00",
        "portfolioURL": "https://tonystark.dev",
        "availabilityStatus": "AVAILABLE",
        "user": {
            "fullName": "Tony Stark",
            "email": "tony@stark.com",
            "registrationDate": "2026-04-10T..."
        },
        "knownTechs": [ ... ]
    }
}
```

**Error Responses:**

| Status | Reason |
|--------|--------|
| `401` | Not authenticated |
| `404` | Developer not found |

---

### `PATCH /profiles/developers/me`

Updates the currently logged-in developer's profile. Only send the fields you want to change — all fields are optional.

**Why it exists:** Settings / edit profile page for developers. Uses PATCH (not PUT) because it's a partial update — you only send what changed, and everything else stays untouched. Updates span two database tables (User + Developer) atomically via a transaction.

**Required Role:** `DEVELOPER`

**Request Body (all fields optional):**

```json
{
    "fullName": "Tony Stark Updated",
    "phoneNumber": "+14155551234",
    "hourlyRate": 150.00,
    "portfolioURL": "https://tonystark.dev",
    "availabilityStatus": "BUSY",
    "experienceYears": 12
}
```

| Field | Type | Constraints |
|-------|------|-------------|
| `fullName` | string | Cannot be empty if provided |
| `phoneNumber` | string | Valid mobile number |
| `hourlyRate` | float | 0 — 9999.99 |
| `portfolioURL` | string | Valid URL |
| `availabilityStatus` | string | `AVAILABLE`, `BUSY`, or `UNAVAILABLE` |
| `experienceYears` | integer | 0 — 50 |

**Response `200`:**

```json
{
    "success": true,
    "data": {
        "developerID": "uuid",
        "experienceYears": 12,
        "hourlyRate": "150.00",
        "portfolioURL": "https://tonystark.dev",
        "availabilityStatus": "BUSY",
        "user": {
            "fullName": "Tony Stark Updated",
            "email": "tony@stark.com",
            "phoneNumber": "+14155551234"
        }
    }
}
```

**Error Responses:**

| Status | Reason |
|--------|--------|
| `400` | Validation failed |
| `401` | Not authenticated |
| `403` | Logged-in user is not a developer |
| `404` | Developer profile not found |

---

## 3. Client Profiles

### `GET /profiles/clients/:id`

Returns a single client profile by their `clientID`.

**Why it exists:** Powers the client profile view page, visible to developers who want to know more about a client before accepting a contract.

**Response `200`:**

```json
{
    "success": true,
    "data": {
        "clientID": "uuid",
        "companyName": "Wayne Enterprises",
        "billingAddress": "1007 Mountain Drive, Gotham",
        "country": "USA",
        "user": {
            "fullName": "Bruce Wayne",
            "registrationDate": "2026-04-10T..."
        }
    }
}
```

**Error Responses:**

| Status | Reason |
|--------|--------|
| `401` | Not authenticated |
| `404` | Client not found |

---

### `PATCH /profiles/clients/me`

Updates the currently logged-in client's profile. Only send the fields you want to change.

**Why it exists:** Settings / edit profile page for clients. Same PATCH semantics as the developer update — partial, atomic, cross-table.

**Required Role:** `CLIENT`

**Request Body (all fields optional):**

```json
{
    "fullName": "Bruce Wayne Updated",
    "phoneNumber": "+14155559876",
    "companyName": "Wayne Industries",
    "billingAddress": "1007 Mountain Drive, Gotham",
    "country": "USA"
}
```

| Field | Type | Constraints |
|-------|------|-------------|
| `fullName` | string | Cannot be empty if provided |
| `phoneNumber` | string | Valid mobile number |
| `companyName` | string | |
| `billingAddress` | string | |
| `country` | string | Cannot be empty if provided |

**Response `200`:**

```json
{
    "success": true,
    "data": {
        "clientID": "uuid",
        "companyName": "Wayne Industries",
        "billingAddress": "1007 Mountain Drive, Gotham",
        "country": "USA",
        "user": {
            "fullName": "Bruce Wayne Updated",
            "email": "bruce@wayne.com",
            "phoneNumber": "+14155559876"
        }
    }
}
```

**Error Responses:**

| Status | Reason |
|--------|--------|
| `400` | Validation failed |
| `401` | Not authenticated |
| `403` | Logged-in user is not a client |
| `404` | Client profile not found |

---

## 4. Account Deletion

### `DELETE /profiles/users/me`

Permanently deletes the currently authenticated user and their associated profile (developer or client). This is irreversible.

**Why it exists:** Account deletion is required for user data control. The delete cascades to the developer/client sub-profile. Will fail if the user has active contracts (foreign key constraint protection).

**Request Body:** None

**Response `200`:**

```json
{
    "success": true,
    "message": "Account deleted successfully"
}
```

**Error Responses:**

| Status | Reason |
|--------|--------|
| `401` | Not authenticated |
| `404` | User not found |
| `409` | User has active contracts and cannot be deleted |

---

## 5. File Uploads

### `POST /uploads/image`

Uploads a file to cloud storage (ImageKit) and returns the public URL. If the authenticated user is a developer, the URL is automatically saved as their `portfolioURL`.

**Why it exists:** Centralized file upload endpoint. Currently used for profile images and portfolio files. Accepts JPEG, PNG, WebP, and PDF up to 5MB.

**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field | Type | Notes |
|-------|------|-------|
| `file` | file | Max 5MB. Allowed: JPEG, PNG, WebP, PDF |

**Response `200`:**

```json
{
    "success": true,
    "url": "https://ik.imagekit.io/your-id/files/backend/file_1712700000_photo.jpg"
}
```

**Error Responses:**

| Status | Reason |
|--------|--------|
| `400` | No file uploaded or invalid file type |
| `401` | Not authenticated |
| `500` | Cloud upload failed |

---

## Error Response Format

All errors follow a consistent shape:

**Validation errors (400):**

```json
{
    "success": false,
    "errors": [
        {
            "type": "field",
            "value": "not-an-email",
            "msg": "Valid email is required",
            "path": "email",
            "location": "body"
        }
    ]
}
```

**Other errors (401, 403, 404, 409, 500):**

```json
{
    "success": false,
    "message": "Human-readable error message"
}
```

---

## Authentication Flow Summary

```
┌─────────────┐     POST /auth/register      ┌──────────┐
│  New User   │ ──────────────────────────▶   │  Server  │
│             │ ◀────────────────────────── │          │
│             │     { token, user }           │          │
│             │                               │          │
│             │     POST /auth/login          │          │
│  Returning  │ ──────────────────────────▶   │          │
│  User       │ ◀────────────────────────── │          │
│             │     { token, user }           │          │
│             │                               │          │
│  Store token in localStorage                │          │
│  Send as: Authorization: Bearer <token>     │          │
│             │                               │          │
│             │     GET /auth/me              │          │
│  App Start  │ ──────────────────────────▶   │          │
│             │ ◀────────────────────────── │          │
│             │     { user }                  │          │
│             │                               │          │
│             │     POST /auth/refresh        │          │
│  Before     │ ──────────────────────────▶   │          │
│  Expiry     │ ◀────────────────────────── │          │
│             │     { new token }             │          │
│             │                               │          │
│             │     POST /auth/logout         │          │
│  Logout     │ ──────────────────────────▶   │          │
│             │     Clear localStorage        │          │
└─────────────┘                               └──────────┘
```

---

## Rate Limiting

All endpoints are rate-limited to **100 requests per 15 minutes** per IP address. When exceeded:

```json
{
    "success": false,
    "message": "Too many requests, please try again later"
}
```

Status code: `429`
