# Copilot Prompt: API Integration Layer — Kinetic Editorial Freelance Portal

## Context & Ground Rules

You are setting up the **API integration base layer** for a React frontend (Vite + React Router). The frontend is **already fully built** with mock data. Your job is to:

1. Create a clean `apiService.js` (or `api/` folder structure) with all API call functions
2. Create a custom `useApi` hook for data fetching with loading/error state
3. **DO NOT remove or modify any mock data** in `mockData.js` — it stays untouched for now
4. **DO NOT modify any existing JSX components** — only create new service files
5. Use `axios` for HTTP requests (install if not present)
6. All API calls should read the base URL from an environment variable: `import.meta.env.VITE_API_BASE_URL`

---

## Tech Stack

- **Frontend:** React (Vite), React Router v6
- **HTTP Client:** axios
- **Auth:** JWT stored in `localStorage` as `ke_token`
- **Backend:** Node.js + Express (already being built separately — endpoints listed below)

---

## Step 1: Install Dependencies

```bash
npm install axios
```

---

## Step 2: Create `src/api/axiosInstance.js`

```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ke_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ke_token');
      window.location.href = '/auth';
    }
    return Promise.reject(err);
  }
);

export default api;
```

---

## Step 3: Create `src/api/services/authService.js`

Maps to: `/auth` endpoints

```js
import api from '../axiosInstance';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  // data: { email, password, role: 'developer' | 'client', name }

  login: (data) => api.post('/auth/login', data),
  // data: { email, password }
  // response: { token, user: { id, role, name } }

  getMe: () => api.get('/auth/me'),
  // Returns current logged-in user info

  refreshToken: () => api.post('/auth/refresh'),

  logout: () => api.post('/auth/logout'),

  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

  resetPassword: (data) => api.put('/auth/reset-password', data),
  // data: { token, newPassword }
};
```

**Frontend pages that will use this:**
- `LoginSignup.jsx` — calls `login()` and `register()`
- App root / protected route wrapper — calls `getMe()` on load

---

## Step 4: Create `src/api/services/profileService.js`

Maps to: `/developers`, `/clients`, `/users` endpoints

```js
import api from '../axiosInstance';

export const profileService = {
  // Developer
  getAllDevelopers: (params) => api.get('/developers', { params }),
  // params: { tech, page, limit }

  getDeveloperById: (id) => api.get(`/developers/${id}`),

  updateMyDeveloperProfile: (data) => api.put('/developers/me', data),
  // data: { hourlyRate, availabilityStatus, portfolioLink }

  // Client
  getClientById: (id) => api.get(`/clients/${id}`),

  updateMyClientProfile: (data) => api.put('/clients/me', data),
  // data: { companyName, billingAddress, country }

  // Account
  deleteMyAccount: () => api.delete('/users/me'),
};
```

**Frontend pages that will use this:**
- `DeveloperProfile.jsx` — calls `getDeveloperById()` and `updateMyDeveloperProfile()`

---

## Step 5: Create `src/api/services/skillsService.js`

Maps to: `/technologies`, `/developers/me/skills` endpoints

```js
import api from '../axiosInstance';

export const skillsService = {
  getAllTechnologies: () => api.get('/technologies'),
  // Used to populate skill dropdown in profile editor

  addSkill: (data) => api.post('/developers/me/skills', data),
  // data: { technologyId, proficiencyLevel: 'Beginner'|'Intermediate'|'Advanced'|'Expert' }

  updateSkill: (skillId, data) => api.put(`/developers/me/skills/${skillId}`, data),

  removeSkill: (skillId) => api.delete(`/developers/me/skills/${skillId}`),
};
```

**Frontend pages that will use this:**
- `DeveloperProfile.jsx` — skill management section

---

## Step 6: Create `src/api/services/contractService.js`

Maps to: `/contracts`, `/applications` endpoints

```js
import api from '../axiosInstance';

export const contractService = {
  // Applications (Step 1 of PostContract form)
  createApplication: (data) => api.post('/applications', data),
  // data: { name, type: 'Web'|'Mobile'|'Desktop', currentVersion, description }

  getMyApplications: () => api.get('/applications'),

  getApplicationById: (id) => api.get(`/applications/${id}`),

  updateApplication: (id, data) => api.put(`/applications/${id}`, data),

  deleteApplication: (id) => api.delete(`/applications/${id}`),

  // Contracts (Steps 2-4 of PostContract form)
  createContract: (data) => api.post('/contracts', data),
  // data: { applicationId, title, description, startDate, endDate, budget, contractType }

  getMyContracts: () => api.get('/contracts'),
  // Returns client's created contracts OR developer's assigned contracts based on JWT role

  getContractById: (id) => api.get(`/contracts/${id}`),
  // Returns contract + milestones + team + bugs + tech stack

  updateContract: (id, data) => api.put(`/contracts/${id}`, data),

  updateContractStatus: (id, status) => api.patch(`/contracts/${id}/status`, { status }),
  // status: 'DRAFT' | 'SIGNED' | 'IN_PROGRESS' | 'COMPLETED'

  // Contract Tech Stack
  addRequiredTech: (contractId, technologyId) =>
    api.post(`/contracts/${contractId}/tech`, { technologyId }),

  removeRequiredTech: (contractId, techId) =>
    api.delete(`/contracts/${contractId}/tech/${techId}`),

  // Team Assignment
  assignDeveloper: (contractId, data) =>
    api.post(`/contracts/${contractId}/team`, data),
  // data: { developerId, role, contributionPercent, paymentShare }

  updateTeamMember: (teamId, data) => api.put(`/contracts/team/${teamId}`, data),

  removeTeamMember: (teamId) => api.delete(`/contracts/team/${teamId}`),
};
```

**Frontend pages that will use this:**
- `PostContract.jsx` — full multi-step form submission
- `ClientDashboard.jsx` — calls `getMyContracts()`
- `DeveloperDashboard.jsx` — calls `getMyContracts()`

---

## Step 7: Create `src/api/services/jobService.js`

Maps to: `/contracts` (public listing view) and `/applications` for browsing developers

```js
import api from '../axiosInstance';

export const jobService = {
  getPublicJobListings: (params) => api.get('/contracts', { params }),
  // params: { tech, category, budgetMin, budgetMax, page, limit }
  // This is the public browse view — backend returns only SIGNED/IN_PROGRESS contracts
};
```

**Frontend pages that will use this:**
- `JobListings.jsx` — replaces `allJobs` mock data

---

## Step 8: Create `src/api/services/milestoneService.js`

Maps to: `/milestones` endpoints

```js
import api from '../axiosInstance';

export const milestoneService = {
  createMilestone: (contractId, data) =>
    api.post(`/contracts/${contractId}/milestones`, data),
  // data: { title, description, dueDate, amount }

  getMilestonesByContract: (contractId) =>
    api.get(`/contracts/${contractId}/milestones`),

  getMilestoneById: (id) => api.get(`/milestones/${id}`),

  updateMilestone: (id, data) => api.put(`/milestones/${id}`, data),

  updateMilestoneStatus: (id, status) =>
    api.patch(`/milestones/${id}/status`, { status }),
  // status: 'PENDING' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED'

  deleteMilestone: (id) => api.delete(`/milestones/${id}`),
};
```

**Frontend pages that will use this:**
- `Milestones.jsx` — replaces `milestones` mock data
- `PostContract.jsx` — Step 3 (milestone creation during contract setup)

---

## Step 9: Create `src/api/services/escrowService.js`

Maps to: `/escrow` endpoints

```js
import api from '../axiosInstance';

export const escrowService = {
  depositToEscrow: (data) => api.post('/escrow/deposit', data),
  // data: { milestoneId, amount, paymentMethodId }
  // Connects to Stripe on backend

  releaseEscrow: (escrowId) => api.post(`/escrow/${escrowId}/release`),
  // Client approves work — funds sent to developer

  refundEscrow: (escrowId) => api.post(`/escrow/${escrowId}/refund`),

  getEscrowHistory: () => api.get('/escrow/history'),
  // Returns all escrow transactions for current user
};
```

**Frontend pages that will use this:**
- `Earnings.jsx` — calls `getEscrowHistory()` to replace `earningsTransactions` mock

---

## Step 10: Create `src/api/services/bugService.js`

Maps to: `/bugs` endpoints

```js
import api from '../axiosInstance';

export const bugService = {
  reportBug: (contractId, data) =>
    api.post(`/contracts/${contractId}/bugs`, data),
  // data: { title, description, severity: 'Critical'|'High'|'Medium'|'Low' }

  getBugsByContract: (contractId) =>
    api.get(`/contracts/${contractId}/bugs`),

  updateBug: (bugId, data) => api.put(`/bugs/${bugId}`, data),

  updateBugStatus: (bugId, status) =>
    api.patch(`/bugs/${bugId}/status`, { status }),
  // status: 'REPORTED' | 'IN_PROGRESS' | 'RESOLVED'

  deleteBug: (bugId) => api.delete(`/bugs/${bugId}`),
};
```

**Frontend pages that will use this:**
- `BugReports.jsx` — replaces `bugReports` mock data

---

## Step 11: Create `src/api/services/statsService.js`

Maps to: `/stats/dashboard`

```js
import api from '../axiosInstance';

export const statsService = {
  getDashboardStats: () => api.get('/stats/dashboard'),
  // Returns: { activeContracts, totalEarned, pendingAmount, profileViews,
  //            budgetCommitted, activeApplications, contractsWon, developersHired }
};
```

**Frontend pages that will use this:**
- `DeveloperDashboard.jsx` — replaces `developerDashboardStats` mock
- `ClientDashboard.jsx` — replaces `clientDashboardStats` mock

---

## Step 12: Create `src/api/services/uploadService.js`

```js
import api from '../axiosInstance';

export const uploadService = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  // Returns: { url: 'https://cdn.example.com/...' }

  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/uploads/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
```

---

## Step 13: Create `src/api/hooks/useApi.js`

A generic reusable hook for any GET call with loading + error state:

```js
import { useState, useEffect, useCallback } from 'react';

export function useApi(apiCall, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiCall();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => { execute(); }, [execute]);

  return { data, loading, error, refetch: execute };
}
```

**Usage example (how a teammate will later use it in a component):**
```js
// FUTURE usage — do not modify components yet
const { data: contracts, loading, error } = useApi(() => contractService.getMyContracts());
```

---

## Step 14: Create `src/api/hooks/useAuth.js`

```js
import { useState } from 'react';
import { authService } from '../services/authService';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(credentials);
      localStorage.setItem('ke_token', res.data.token);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.register(userData);
      localStorage.setItem('ke_token', res.data.token);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    localStorage.removeItem('ke_token');
    window.location.href = '/';
  };

  return { login, register, logout, loading, error };
}
```

---

## Step 15: Create `.env.example` in project root

```
VITE_API_BASE_URL=http://localhost:5000/api
```

Also create `.env.local` with the same content for local development. Add `.env.local` to `.gitignore`.

---

## Final Folder Structure After This Task

```
src/
├── api/
│   ├── axiosInstance.js
│   ├── hooks/
│   │   ├── useApi.js
│   │   └── useAuth.js
│   └── services/
│       ├── authService.js
│       ├── profileService.js
│       ├── skillsService.js
│       ├── contractService.js
│       ├── jobService.js
│       ├── milestoneService.js
│       ├── escrowService.js
│       ├── bugService.js
│       ├── statsService.js
│       └── uploadService.js
├── data/
│   └── mockData.js        ← DO NOT TOUCH
├── components/            ← DO NOT TOUCH
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   └── Footer.jsx
└── pages/                 ← DO NOT TOUCH
    ├── LandingPage.jsx
    ├── LoginSignup.jsx
    ├── JobListings.jsx
    ├── PostContract.jsx
    ├── DeveloperDashboard.jsx
    ├── ClientDashboard.jsx
    ├── DeveloperProfile.jsx
    ├── Milestones.jsx
    ├── Earnings.jsx
    ├── BugReports.jsx
    └── NotFound.jsx
```

---

## Summary: Which Service Maps to Which Page

| Service File | Frontend Page | Mock Data It Will Replace (Later) |
|---|---|---|
| `authService.js` | `LoginSignup.jsx` | — |
| `statsService.js` | `DeveloperDashboard.jsx`, `ClientDashboard.jsx` | `developerDashboardStats`, `clientDashboardStats` |
| `contractService.js` | `ClientDashboard.jsx`, `DeveloperDashboard.jsx`, `PostContract.jsx` | `clientContracts`, `developerJobsForDashboard` |
| `jobService.js` | `JobListings.jsx` | `allJobs` |
| `milestoneService.js` | `Milestones.jsx`, `PostContract.jsx` | `milestones` |
| `escrowService.js` | `Earnings.jsx` | `earningsTransactions` |
| `bugService.js` | `BugReports.jsx` | `bugReports` |
| `profileService.js` + `skillsService.js` | `DeveloperProfile.jsx` | `developerSkills`, `developerExperiences` |
| `uploadService.js` | `DeveloperProfile.jsx`, `PostContract.jsx` | — |
