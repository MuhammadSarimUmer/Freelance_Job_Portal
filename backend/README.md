# Freelance Portal — Backend API Reference

**Base URL:** `http://localhost:3000/api/v1`

**Environment Variables (.env):**

```
PORT=3000
DATABASE_URL=...
JWT_SECRET=...
CLIENT_ID=...
CLIENT_SECRET=...
REFRESH_TOKEN=...
EMAIL_PROVIDER=brevo
BREVO_API_KEY=...
RESEND_API_KEY=...
EMAIL_FROM="Freelance Job Portal <noreply@yourdomain.com>"
EMAIL_FROM_NAME="Freelance Job Portal"
EMAIL_VERIFY_TTL_MINUTES=60
PASSWORD_RESET_OTP_TTL_MINUTES=10
PASSWORD_RESET_OTP_MAX_ATTEMPTS=5
```

Notes:
- Use `EMAIL_PROVIDER=brevo` for Brevo API sending (recommended for your free-tier setup).
- `RESEND_API_KEY` is only required when `EMAIL_PROVIDER=resend`.
- `EMAIL_FROM` should be a verified sender in the selected provider.

TODO-DEADLINE: Add email verification + OTP env vars (do not remove)

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

To upload a profile image during registration, send `multipart/form-data` with field `file` (JPEG/PNG/WebP) and include the other fields as text. The image is optional.

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

TODO-DEADLINE: Add email verification endpoints here (do not remove)

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

nodemailer will be implemented abhi implement nhi kia hay email system

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

TODO-DEADLINE: Document OTP reset endpoint here (do not remove)

---

## 2. Developer Profiles

When uploading a profile image, use `multipart/form-data` with field `file`. For regular updates without images, send JSON with `Content-Type: application/json`.

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

To upload a profile image, send `multipart/form-data` with field `file` (JPEG/PNG/WebP) and include any other fields as text.
To remove a profile image, send JSON with `removeProfileImage: true`.

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
            "phoneNumber": "+14155551234",
            "profileImageUrl": "https://ik.imagekit.io/your-id/files/backend/file_1712700000_avatar.png"
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

When uploading a profile image, use `multipart/form-data` with field `file`. For regular updates without images, send JSON with `Content-Type: application/json`.

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

To upload a profile image, send `multipart/form-data` with field `file` (JPEG/PNG/WebP) and include any other fields as text.
To remove a profile image, send JSON with `removeProfileImage: true`.

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
            "phoneNumber": "+14155559876",
            "profileImageUrl": "https://ik.imagekit.io/your-id/files/backend/file_1712700000_avatar.png"
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


## 6. Technologies & Skills

### `GET /technologies`

Returns all available technology stacks.

**Response `200`:**

```json
{
    "success": true,
    "data": [
        {
            "techID": "uuid",
            "techName": "React",
            "category": "Frontend",
            "version": "18"
        }
    ]
}
```

---

### `POST /technologies`

Creates a new technology stack entry.

**Request Body:**

```json
{
    "techName": "React",
    "category": "Frontend",
    "version": "18"
}
```

**Response `201`:**

```json
{
    "success": true,
    "message": "Technology created successfully",
    "data": {
        "techID": "uuid",
        "techName": "React",
        "category": "Frontend",
        "version": "18"
    }
}
```

---

### `POST /technologies/skills`

Adds a skill to the currently logged-in developer.

**Required Role:** `DEVELOPER`

**Request Body:**

```json
{
    "techID": "uuid",
    "proficiencyLevel": "EXPERT",
    "yearsExperience": 5
}
```

**Response `201`:**

```json
{
    "success": true,
    "message": "Skill added successfully",
    "data": {
        "developerID": "uuid",
        "techID": "uuid",
        "proficiencyLevel": "EXPERT",
        "yearsExperience": 5
    }
}
```

---

### `PUT /technologies/skills/:techID`

Updates a developer skill.

**Required Role:** `DEVELOPER`

**Request Body (any field optional):**

```json
{
    "proficiencyLevel": "INTERMEDIATE",
    "yearsExperience": 3
}
```

**Response `200`:**

```json
{
    "success": true,
    "message": "Skill updated successfully",
    "data": {
        "developerID": "uuid",
        "techID": "uuid",
        "proficiencyLevel": "INTERMEDIATE",
        "yearsExperience": 3
    }
}
```

---

### `DELETE /technologies/skills/:techID`

Deletes a developer skill.

**Required Role:** `DEVELOPER`

**Response `200`:**

```json
{
    "success": true,
    "message": "Skill deleted successfully"
}
```

---

## 7. Applications

### `POST /applications`

Creates a new application record.

**Request Body:**

```json
{
    "appName": "NextGen CRM",
    "appType": "Web",
    "description": "Internal CRM tool",
    "currentVersion": "1.0.0"
}
```

**Response `201`:**

```json
{
    "success": true,
    "message": "Application created successfully",
    "data": { "appID": "uuid", "appName": "NextGen CRM" }
}
```

---

### `GET /applications`

Returns all applications.

---

### `GET /applications/:id`

Returns a single application with its contracts.

---

### `PUT /applications/:id`

Updates an application.

---

### `DELETE /applications/:id`

Deletes an application (fails if contracts exist).

---

## 8. Contracts

### `POST /contracts`

Creates a new contract (clients only).

**Required Role:** `CLIENT`

**Request Body:**

```json
{
    "appID": "uuid",
    "title": "Build CRM",
    "description": "Scope for CRM build",
    "startDate": "2026-04-11",
    "endDate": "2026-06-01",
    "totalAmount": 15000
}
```

---

### `GET /contracts`

Returns contracts for the current user (clients see their contracts, developers see assigned contracts).

**Required Role:** `CLIENT` or `DEVELOPER`

---

### `GET /contracts/:id`

Returns a single contract by ID.

**Required Role:** `CLIENT` or `DEVELOPER`

---

### `PUT /contracts/:id`

Updates a contract (clients only, only when status is `DRAFT`).

**Required Role:** `CLIENT`

---

### `PATCH /contracts/:id/status`

Updates contract status (clients only).

**Required Role:** `CLIENT`

**Request Body:**

```json
{
    "status": "IN_PROGRESS"
}
```

---

### `POST /contracts/:id/tech`

Adds a required technology to a contract (clients only).

**Required Role:** `CLIENT`

**Request Body:**

```json
{
    "techID": "uuid",
    "requiredLevel": "EXPERT",
    "purpose": "Frontend"
}
```

---

### `POST /contracts/:id/team`

Assigns a developer to a contract (clients only).

**Required Role:** `CLIENT`

**Request Body:**

```json
{
    "developerID": "uuid",
    "role": "Frontend Lead",
    "contributionPercentage": 50,
    "paymentShare": 50
}
```

---

### `DELETE /contracts/:id`

Deletes a contract (clients only).

**Required Role:** `CLIENT`

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

TODO-DEADLINE: Update flow diagram for verification + OTP (do not remove)

---

TODO-DEADLINE: Add verification + OTP Postman workflow here (do not remove)

## Rate Limiting

All endpoints are rate-limited to **100 requests per 15 minutes** per IP address. When exceeded:

```json
{
    "success": false,
    "message": "Too many requests, please try again later"
}
```

Status code: `429`
