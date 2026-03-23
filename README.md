Task Manager API
A RESTful API for managing tasks built with Node.js and Express.js. Supports full CRUD operations, input validation, filtering by completion status, sorting by creation date, and priority management — all backed by in-memory storage seeded from tasks.json.

├── app.js                 # Express app — mounts routes, starts server
├── package.json           # Scripts and dependencies
├── tasks.json             # Seed data — 15 pre-loaded tasks
├── routes/
│   └── tasks.js           # Route definitions and request validation
├── store/
│   └── tasks.js           # In-memory data store and all data operations
└── test/
    └── server.test.js     # Test suite (tap + supertest)

API References

# 1
# GET All Tasks

        GET /tasks ==> Returns all tasks. Supports optional query parameters for filtering and sorting.

        Examples
        # All tasks
        GET /tasks

        # Only completed tasks
        GET /tasks?completed=true

        # Incomplete tasks, newest first
        GET /tasks?completed=false&sort=desc

        # All tasks sorted oldest first
        GET /tasks?sort=asc

        # Response 200 OK
        =====
        [
        {
            "id": 1,
            "title": "Set up environment",
            "description": "Install Node.js, npm, and git",
            "completed": true,
            "priority": "high",
            "createdAt": "2024-01-01T00:00:00.000Z"
        }
        ]
        =====

# 2

# Get task by ID

        GET /tasks/:id

        Example

        GET /tasks/1

        # Response 200 OK
        =====
        {
        "id": 1,
        "title": "Set up environment",
        "description": "Install Node.js, npm, and git",
        "completed": true,
        "priority": "high",
        "createdAt": "2024-01-01T00:00:00.000Z"
        }
        =====

        # Response 404 Not Found
        { "error": "Task not found" }

# 3

# Get task by priority

        GET /tasks/priority/:level

        level string => low, medium, high

        GET /tasks/priority/high
        GET /tasks/priority/medium
        GET /tasks/priority/low

        Response 200 OK
        ==================
        [
        {
            "id": 1,
            "title": "Set up environment",
            "description": "Install Node.js, npm, and git",
            "completed": true,
            "priority": "high",
            "createdAt": "2024-01-01T00:00:00.000Z"
        }
        ]
        ==================
        Response 400 Bad Request (invalid level)
        ==================
        { "error": "Invalid priority. Must be one of: low, medium, high" }

# 4

# Create a task

        POST /tasks

        Request body
        ============
        {
        "title": "New Task",
        "description": "Task description",
        "completed": false,
        "priority": "medium"
        }
        ============

        title string        => Must be non-empty
        description string  => Can be empty string
        completed           => Must be true or false — not a string
        prioritystring      => can be low, medium, high — defaults to medium

        Example:

        curl -X POST http://localhost:3000/tasks \
        -H "Content-Type: application/json" \
        -d '{"title":"New Task","description":"Task description","completed":false,"priority":"high"}'

        Response 201 Created

        =======
        {
        "id": 16,
        "title": "New Task",
        "description": "Task description",
        "completed": false,
        "priority": "high",
        "createdAt": "2024-03-01T10:00:00.000Z"
        }
        ======

        Response 400 Bad Request

        ======
        {
        "errors": [
            "completed must be a boolean"
        ]
        }
        ======

# 5

# Update a task

        PUT /tasks/:id

        id => Numeric task ID

        Request body

        =======
        {
        "title": "Updated Task",
        "description": "Updated description",
        "completed": true,
        "priority": "low"
        }
        =======

        Example

        =======
        curl -X PUT http://localhost:3000/tasks/1 \
        -H "Content-Type: application/json" \
        -d '{"title":"Updated Task","description":"Updated description","completed":true,"priority":"low"}'
        =======

        Response 200 OK

        =======
        {
        "id": 1,
        "title": "Updated Task",
        "description": "Updated description",
        "completed": true,
        "priority": "low",
        "createdAt": "2024-01-01T00:00:00.000Z"
        }
        =======

        Response 404 Not Found
        =======
        { "error": "Task not found" }
        =======

        Response 400 Bad Request
        =======
        {
        "errors": [
            "completed must be a boolean"
        ]
        }
        =======

# 6

        # Delete a task

        DELETE /tasks/:id

        id => Numeric task ID

        Example

        ======
        curl -X DELETE http://localhost:3000/tasks/1
        ======

        Response 200 OK

        ======
        { "message": "Task deleted successfully" }
        ======

        Response 404 Not Found

        =====
        { "error": "Task not found" }
        =====

# Task Schema

id          number      Auto-incremented unique identifier
title       string      Short title of the task
description string      Detailed description
completed   boolean     Completion status
priority    string      low, medium, or high
createdAt   ISO string  Timestamp set on creation

# Validation Rules

title       Required.                                   Must be a non-empty string.
description Required.                                   Must be a string.
completed   Required.                                   Must be a boolean — passing "true" or "false" as a string returns 400.
priority    Optional on create (defaults to medium).    When provided, must be low, medium, or high.

# Error Responses

# Single error

{ "error": "Human-readable message" }

# Validation errors

{
  "errors": [
    "title is required and must be a non-empty string",
    "completed must be a boolean"
  ]
}

# HTTP status codes used

200 Success 
201 Resource created
400 Bad request / validation failed
404 Resource not found

# Running Tests

The test suite uses tap and supertest.

npm run test

Tests cover:

POST /tasks — valid creation and missing field validation
GET /tasks — returns all tasks with correct shape and types
GET /tasks/:id — returns correct task and 404 for unknown id
PUT /tasks/:id — full update, 404 for unknown id, 400 for invalid data
DELETE /tasks/:id — successful delete and 404 for unknown id

# Tech Stack

express         ^4.18.2 HTTP framework
tap             ^18.7.2 Test runner
supertest       ^6.3.4  HTTP integration testing
nodemon         ^3.0.1  Dev server with auto-restart