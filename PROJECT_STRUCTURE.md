# Project Structure Guide

This repository is an npm workspace monorepo.

## Root workspace

Location: `d:\CS\ITI-MERN\Final-Proj\Orchest`

Contains:

- `package.json` with `workspaces: ["shared", "app/backend", "app/frontend"]`
- root `node_modules/`
- workspace dependency installation and hoisting

Recommended commands:

- `npm install`
- `npm run build --workspaces`
- `npm run lint --workspaces`
- `npm install <pkg> -w @orchest/backend`
- `npm install <pkg> -w @orchest/frontend`

## Shared package

Location: `shared/`
Package name: `@orchest/shared`

Purpose:

- Shared DTOs, enums, types, constants, and reusable code used by backend and frontend
- Cross-project data contracts and validations

Put here:

- shared type definitions
- shared request/response DTOs
- shared enums
- shared constants

## Backend package

Location: `app/backend/`
Package name: `@orchest/backend`

Purpose:

- NestJS API server
- backend-only logic, database models, services, controllers, auth, and API routes

Structure:

- `src/main.ts`
- `src/app.module.ts`
- `src/modules/`
- `src/modules/projects/`, `src/modules/tasks/`, `src/modules/users/`, etc.

Put here:

- API controllers and services
- entities and database access
- NestJS modules and middleware
- server-side business logic

## Frontend package

Location: `app/frontend/`
Package name: `@orchest/frontend`

Purpose:

- React + Vite user interface
- browser-only UI code and frontend application logic

Structure:

- `src/main.tsx`
- `src/App.tsx`
- `vite.config.ts`
- `src/` for React components and pages

Put here:

- React components and hooks
- pages and UI state
- frontend routing and presentation logic
- client-side integration with backend APIs

## Dependency behavior

- The root install is primary.
- A workspace package may not have its own `node_modules/` if dependencies are hoisted to the root.
- `app/frontend/node_modules/` may exist if install was run inside that folder separately.
- `app/backend` is expected to resolve dependencies from the workspace root in normal operation.

## Agent guidance

For a code agent working in this project:

- backend code -> `app/backend/src/...`
- frontend code -> `app/frontend/src/...`
- shared code -> `shared/src/...`
- dependency changes -> root workspace or `npm install <pkg> -w <workspace>`
