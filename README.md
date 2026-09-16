# Mini Job Queue Dashboard

A full-stack job queue dashboard built with React and NestJS.

## Features

- Create jobs
- View all jobs
- Filter jobs by status
- Update job status
- Delete jobs
- Display job counts by status
- Loading and API error states
- Backend request validation
- Server-side job status transition validation
- Concurrency-safe status updates
- Automated backend tests

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- NestJS
- TypeORM
- SQLite
- class-validator
- Vitest

## Job Status Flow

Jobs follow these allowed transitions:

pending → running
running → completed
running → failed

`completed` and `failed` are terminal states.

Invalid transitions such as `pending → completed` or `completed → running` are rejected by the backend.

The transition rules are enforced server-side so they cannot be bypassed by modifying the frontend or sending requests directly to the API.

## API

### Create a job

`POST /jobs`

Request:

{
"title": "Build portfolio",
"type": "frontend"
}

New jobs are created with `pending` status.

### Get all jobs

`GET /jobs`

Returns all jobs, newest first.

### Update job status

`PATCH /jobs/:id/status`

Request:

{
"status": "running"
}

Only valid status transitions are accepted.

### Delete a job

`DELETE /jobs/:id`

Deletes the specified job.

## Validation & Error Handling

The backend validates incoming request data using NestJS `ValidationPipe` and DTOs.

Invalid values, missing required fields, unknown fields, invalid IDs, missing jobs, and invalid status transitions return appropriate HTTP errors.

Status updates also use a conditional database update based on the job's previously read status. This prevents two concurrent requests from both applying the same stale transition.

## Local Setup

### Backend

cd backend
npm install
npm run start:dev

The backend runs on:

http://localhost:3000

### Frontend

cd frontend
npm install
npm run dev

The frontend runs on:

http://localhost:5173

## Testing

Backend tests can be run with:

cd backend
npm test

The test suite covers job creation, retrieval, valid and invalid status transitions, missing jobs, deletion, and concurrent stale updates.

## Database

SQLite is used for simplicity and portability in this take-home assignment.

TypeORM's `synchronize` option is enabled for local development. For a production application, database migrations would be preferred.

## Assumptions & Tradeoffs

- SQLite was chosen instead of PostgreSQL to keep setup simple and make the project easy to run locally.
- Authentication and authorization were not included because they were outside the assignment requirements.
- Jobs are manually created and their statuses are manually updated; there is no background worker processing jobs.
- The frontend API URL is configured separately for local and deployed environments.

## Possible Improvements

If this were developed further, I would consider:

- PostgreSQL for a production deployment
- Database migrations
- Environment-based configuration and secrets management
- Authentication and authorization
- Pagination for large job lists
- A real background worker/queue system
- More comprehensive integration/end-to-end tests
- Improved observability and structured logging

## Production-Ready Improvement

### Automated Backend Tests

As a production-ready improvement, I added automated backend tests using Vitest and NestJS's testing utilities.

The tests cover important job lifecycle and API behavior, including:

- Job creation
- Retrieving jobs
- Valid status transitions
- Rejection of invalid status transitions
- Handling non-existent jobs
- Job deletion
- Protection against concurrent stale status updates

This provides a repeatable way to verify the core business logic and helps prevent regressions when the application is modified in the future.

## Live Demo

Frontend: **[Add deployed frontend URL]**

Backend API: **[Add deployed backend URL]**
