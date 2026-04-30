# Polls Backend

Backend API for the Opinion Polls System.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up database:
   - Install PostgreSQL
   - Create a database named `polls_db`
   - Update DATABASE_URL in .env if needed

3. Run Prisma migrations:
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```

4. Seed initial admin user:
   ```bash
   npm run seed
   ```
   Default admin: email `admin@example.com`, password `admin123`

5. Start development server:
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