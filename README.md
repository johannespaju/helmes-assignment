# Sectors form

A small full-stack app built for the Helmes take-home assignment. A user enters their name, picks the sectors they are involved in, and agrees to the terms. When they press **Save**, the input is validated and stored in the database, and the form is refilled with the stored data. The user can keep editing their own submission for the rest of the browser session.

The sector list is stored in the database and loaded from there. There is also a small `/admin` page that lists the people involved in a chosen sector.

**Stack:** .NET 10 Web API, EF Core, SQLite · Angular 21

| Part     | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:4200        |
| API      | http://localhost:5226/swagger    |

## Running

### Option 1: Docker

Requires Docker with Compose.

```bash
docker compose up --build
```

Then open http://localhost:4200. Swagger UI is at http://localhost:5226/swagger.

The SQLite database is kept in the `db-data` volume, so data survives restarts. Run `docker compose down -v` to start fresh.

### Option 2: Run manually

Requires the [.NET 10 SDK](https://dotnet.microsoft.com/download) and [Node.js](https://nodejs.org/) 22+.

**Backend**, in one terminal:

```bash
cd backend
dotnet run --project WebApp
```

The API starts on http://localhost:5226. On startup it creates `app.db` with the schema and the seeded sectors (EF Core `EnsureCreated`). Swagger UI is at http://localhost:5226/swagger.

**Frontend**, in a second terminal:

```bash
cd frontend
npm install
npm start
```

Then open http://localhost:4200.

## Database dump

Text columns are plain `TEXT` because SQLite doesn't enforce lengths. Switching to Postgres would fix that. The API enforces the 128-character name limit instead, with `[MaxLength(128)]` on the DTO.

## Architecture

```
backend/
  Domain/        entities: Sector (self-referencing tree), Submission, SubmissionSector
  DAL/           EF Core DbContext, repositories, sector seed data
  BLL/           services with the business rules
  DTO/           API contracts
  WebApp/        controllers, DI and startup
  WebApp.Tests/  unit and integration tests
frontend/src/app/
  submission-form/  the form, split into person-name, sector-select and terms-checkbox
  session/          tracks the current user's submission
  api/              HTTP clients and models
  admin-page/       search people by sector
```

### Decisions

- **Only sectors with no children can be selected.** Parent sectors such as "Manufacturing" group the options. They are however searchable by parent sectors in /admin.
- **Session is handled in the frontend.** After the first save, the submission id is kept in `sessionStorage`. Later saves update that submission with `PUT` instead of creating a new one, and reloading the page refills the form from the API. The session ends when the tab closes.
- **Validation on both sides.** The Angular form gives immediate feedback. The API validates everything again, including whether the sector ids exist and are selectable, and returns `ValidationProblem` responses.
- **SQLite** so the project runs without installing a database server.
- **`/admin` has no authentication.** It exists to demonstrate querying stored data by sector and is not a real admin area.

## Tests

```bash
# backend: unit tests (services, with Moq) and integration tests (repositories, API via WebApplicationFactory)
cd backend
dotnet test

# frontend: unit tests (Vitest)
cd frontend
npm test

# frontend: end-to-end tests (Playwright, starts ng serve and uses a fake API)
cd frontend
npx playwright install chromium   # first time only
npm run e2e
```
