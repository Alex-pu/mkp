# Pollsmaster Backend

Backend API for Pollsmaster.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up database:
   - Install PostgreSQL
   - Create a database named `polls`
   - Set `DATABASE_URL` in `.env` to a PostgreSQL connection string for that database (see `.env.example`)

3. Run Prisma migrations:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. Add the initial super admin credentials to `backend/.env` (create the file if needed):
   ```env
   SEED_ADMIN_EMAIL=admin@example.com
   SEED_ADMIN_PASSWORD=replace-with-a-strong-password
   SEED_ADMIN_NAME=Super Admin
   ```

5. From the `backend` directory, run the seed command:
   ```bash
   npm run seed
   ```
   This creates a `SUPER_ADMIN` account. If an account with that email already exists, it is left unchanged, including its password.

6. Sign in to the web app using `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`.

7. Start development server:
   ```bash
   npm run dev
   ```

## API Endpoints

- POST /api/auth/login
- POST /api/auth/register
- GET /api/polls
- POST /api/polls
- GET /api/polls/:id
- PUT /api/polls/:id
- POST /api/polls/:pollId/questions
- PUT /api/questions/:id
- DELETE /api/questions/:id
- GET /api/polls/:id/public
- POST /api/polls/:id/vote
- GET /api/polls/:id/analytics
- GET /api/polls/:id/report.pdf (authenticated admin PDF download)
- GET /api/polls/:id/questionnaire.pdf (authenticated admin questionnaire PDF download)
