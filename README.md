# Geekhaven Events Frontend 

## Root
/: Redirects to `/user/home` if `token` exists, otherwise `/auth/sign-in`.

## Auth
/auth/sign-in : GitHub OAuth sign-in screen (redirects to backend OAuth).<br>
/auth/register : New-user registration form (creates participant profile).

## User
/user/home : Event landing list with "Join" and "Leaderboard" actions.<br>
/user/leaderboard : List all events as cards linking to their leaderboards.<br>
/user/leaderboard/:eventName : Event leaderboard table + participant count.<br>
/user/profile : Redirects to `/user/profile/:githubId` from localStorage user data.<br>
/user/profile/:profileName : Public profile with banner, points, PRs, and details.<br>

## User (internal/hidden)
/user/assigned/hidden : Issue list for a repo; expects query params `repoName` and `profileName`.

(Never Used this tbh....)

## Admin
/admin/home : "Change Points" page (search PRs by GitHub ID + event, edit points).<br>
/admin/viewevents : List events with delete actions (admin-only).<br>
/admin/addevent : Create new event with logo/cover uploads (admin-only).<br>

# API Routes Used (frontend)

All calls are based on `NEXT_PUBLIC_BACKEND_URL`.

## Auth
GET `/api/v1/auth/github` : Start GitHub OAuth flow.<br>
POST `/api/v1/register` : Create participant profile (register form).

## Participant / Profile
GET `/api/v1/participant/` : Fetch logged-in participant details.<br>
GET `/api/v1/participant/:profileName/:eventName` : Fetch profile by GitHub ID + event.<br>
GET `/api/v1/participant/:githubId/:eventName/issues` : Fetch issue list per repo for a user.<br>
GET `/api/v1/participant/:githubId/:eventName/pr` : Fetch PR list for a user/event (admin view).

## Events
GET `/api/v1/events/` : Fetch events list.<br>
POST `/api/v1/events/register?eventName=...` : Register logged-in user for an event.<br>
GET `/api/v1/events/:eventName/leaderboard` : Fetch leaderboard rows for an event.

## Admin
POST `/api/v1/admin/create` : Create event (multipart form data).<br>
PATCH `/api/v1/admin/modify` : Modify PR points.<br>
DELETE `/api/v1/admin/delete/:eventName` : Delete event.

## Leaderboard Progress (graph)
GET `/api/v1/leaderboard/progress?eventName=...` : Fetch per-user points over time.

# Environment Variables
`NEXT_PUBLIC_BACKEND_URL` : Backend base URL.<br>
`NEXT_PUBLIC_EVENT_NAME` : Current event name used for registration and profile fetches.

## R/Place Canvas Configuration
The collaborative canvas configuration is managed via `.env` using eight canonical environment variables:
- `NEXT_PUBLIC_CANVAS_WIDTH`: Canvas width in pixels (default: `1000`)
- `NEXT_PUBLIC_CANVAS_HEIGHT`: Canvas height in pixels (default: `600`)
- `NEXT_PUBLIC_CANVAS_DEFAULT_ZOOM`: Initial zoom level (default: `1.0`)
- `NEXT_PUBLIC_CANVAS_MIN_ZOOM`: Minimum zoom boundary (default: `1.0`)
- `NEXT_PUBLIC_CANVAS_MAX_ZOOM`: Maximum zoom boundary (default: `40.0`)
- `NEXT_PUBLIC_CANVAS_ZOOM_STEP`: Zoom increment per action (default: `0.25`)
- `NEXT_PUBLIC_CANVAS_INITIAL_PAN_X`: Initial horizontal pan (default: `0`)
- `NEXT_PUBLIC_CANVAS_INITIAL_PAN_Y`: Initial vertical pan (default: `0`)

For a comprehensive guide, see [docs/canvas-configuration.md](docs/canvas-configuration.md).



# Advice (From terror_quota)
You can't do the frontend, because If you can then you would've been in the WebDev Wing.

So Coordinate With them, and improve the current Design. Every Year the website should be better than the last year (Follow some other theme.....Baaki It's on ur creativity).

Some Ideas are in the [2026.md](2026.md).