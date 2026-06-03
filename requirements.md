# Requirements Document

## Introduction

This feature delivers full Project CRUD functionality across the Orchest monorepo: a NestJS backend (existing skeleton) and a React/Vite frontend (currently minimal). The scope covers project lifecycle management (create, read, update, delete), project member management, milestone management, activity logging, notification side-effects, role-based authorization, and auto-calculated progress. The frontend is built from scratch using React Query and Axios, consuming the existing REST API at `api/v1/projects`. Shared types and DTOs from `@orchest/shared` are extended as needed.

---

## Glossary

- **API**: The NestJS backend REST API served at `/api/v1`.
- **Project**: A work container entity with fields for name, description, status, priority, type, mode, progress, budget, dates, objectives, requirements, and settings. Stored in the `projects` table.
- **ProjectMember**: A join-table record linking a User to a Project with a role (`owner` or `member`). Stored in `project_members`. UNIQUE on `(project_id, user_id)`.
- **Milestone**: A phased goal within a Project. Stored in `milestones`. Progress is derived from completed tasks grouped under it.
- **Owner**: A ProjectMember with role `owner`. Has full control: view, edit tasks, manage members, and delete the project.
- **Member**: A ProjectMember with role `member`. Can view and edit tasks but cannot manage members or delete the project.
- **ActivityLog**: An immutable audit record stored in `activity_logs`. Records user actions across the system with action type, entity type, entity ID, and description.
- **Notification**: An alert record stored in `notifications`. Delivered to specific users when system events occur.
- **Progress**: An integer 0–100 representing the completion percentage of a Project or Milestone.
- **ProjectsService**: The NestJS service class responsible for all project-domain business logic.
- **ProjectsController**: The NestJS controller exposing REST endpoints under `/api/v1/projects`.
- **ActivityLogService**: The NestJS service responsible for writing ActivityLog records.
- **NotificationService**: The NestJS service responsible for writing Notification records.
- **ProjectsPage**: The React page component that lists all projects the authenticated user belongs to.
- **ProjectDetailPage**: The React page component that shows full details, members, and milestones for a single project.
- **ProjectForm**: The React component used to create or update a project.
- **useProjects**: The React Query hook that fetches and caches the project list.
- **useProject**: The React Query hook that fetches and caches a single project by ID.
- **ApiClient**: The Axios instance configured with the base URL and auth headers.

---

## Requirements

### Requirement 1: Create a Project

**User Story:** As an authenticated user, I want to create a new project, so that I can organize and track work for my team.

#### Acceptance Criteria

1. WHEN a POST request is made to `/api/v1/projects` with a valid `CreateProjectDto`, THE ProjectsService SHALL persist a new Project record with `createdBy` set to the authenticated user's ID and `status` defaulting to `planning`.
2. WHEN a project is successfully persisted, THE ProjectsService SHALL insert a ProjectMember record linking the creator's user ID to the project with role `owner`.
3. WHEN a project is successfully persisted, THE ActivityLogService SHALL insert an ActivityLog record with `action = 'created'`, `entity_type = 'project'`, and `entity_id` set to the new project's ID.
4. WHEN a POST request is made to `/api/v1/projects` with a missing or empty `name` field, THE API SHALL return HTTP 400 with a validation error message identifying the invalid field.
5. WHEN a POST request is made to `/api/v1/projects` with an invalid enum value for `priority`, `projectType`, or `projectMode`, THE API SHALL return HTTP 400 with a validation error message identifying the invalid field.
6. WHEN the ProjectForm is submitted with valid data, THE ProjectForm SHALL call the create mutation and, on success, navigate the user to the ProjectDetailPage for the newly created project.

---

### Requirement 2: Read Project List

**User Story:** As an authenticated user, I want to view all projects I am a member of, so that I can quickly navigate to any project I am involved in.

#### Acceptance Criteria

1. WHEN a GET request is made to `/api/v1/projects`, THE ProjectsService SHALL return only the Project records where the authenticated user has a corresponding ProjectMember row.
2. WHEN a GET request is made to `/api/v1/projects` by a user with no project memberships, THE API SHALL return HTTP 200 with an empty array.
3. WHEN the ProjectsPage is rendered, THE useProjects hook SHALL fetch the project list from `GET /api/v1/projects` and make the data available to the page component.
4. WHILE the project list fetch is in progress, THE ProjectsPage SHALL display a loading indicator.
5. IF the project list fetch fails with a network or server error, THEN THE ProjectsPage SHALL display an error message and a retry action.
6. WHEN the project list is loaded, THE ProjectsPage SHALL render one card or row per project displaying at minimum: name, status, priority, and progress.

---

### Requirement 3: Read a Single Project

**User Story:** As an authenticated user, I want to view the full details of a project, so that I can see its description, members, milestones, and current status.

#### Acceptance Criteria

1. WHEN a GET request is made to `/api/v1/projects/:id` for an existing project, THE ProjectsService SHALL return the Project record with its related `members` and `milestones` arrays eagerly loaded.
2. WHEN a GET request is made to `/api/v1/projects/:id` for a non-existent project ID, THE API SHALL return HTTP 404 with a descriptive error message.
3. WHEN the ProjectDetailPage is rendered with a valid project ID, THE useProject hook SHALL fetch the project from `GET /api/v1/projects/:id`.
4. WHILE the single project fetch is in progress, THE ProjectDetailPage SHALL display a loading indicator.
5. IF the single project fetch returns HTTP 404, THEN THE ProjectDetailPage SHALL display a "Project not found" message and a link to navigate back to the ProjectsPage.
6. WHEN a single project is loaded, THE ProjectDetailPage SHALL display the project's name, description, status, priority, type, mode, progress, budget, startDate, endDate, objectives, requirements, member list, and milestone list.

---

### Requirement 4: Update a Project

**User Story:** As a project owner, I want to update a project's details and status, so that I can keep project information current.

#### Acceptance Criteria

1. WHEN a PATCH request is made to `/api/v1/projects/:id` with a valid `UpdateProjectDto` by a user with the `owner` role, THE ProjectsService SHALL apply the provided field changes and return the updated Project.
2. WHEN a PATCH request is made to `/api/v1/projects/:id` by a user who is not a ProjectMember of that project, THE API SHALL return HTTP 403.
3. WHEN a PATCH request is made to `/api/v1/projects/:id` by a ProjectMember with role `member`, THE API SHALL return HTTP 403.
4. WHEN `status` is changed via a PATCH request, THE ActivityLogService SHALL insert an ActivityLog record with `action = 'updated'`, `entity_type = 'project'`, and a description indicating the status change.
5. WHEN `status` is changed via a PATCH request, THE NotificationService SHALL insert a Notification record for each ProjectMember of that project with `type = 'update'` and `reference_type = 'project'`.
6. WHEN a PATCH request is made to `/api/v1/projects/:id` with an `UpdateProjectDto` containing `progress` outside the range 0–100, THE API SHALL return HTTP 400.
7. WHEN the ProjectForm is submitted for an existing project by the owner, THE ProjectForm SHALL call the update mutation and, on success, update the local cache and display the updated data on the ProjectDetailPage.

---

### Requirement 5: Delete a Project

**User Story:** As a project owner, I want to delete a project, so that I can remove projects that are no longer needed.

#### Acceptance Criteria

1. WHEN a DELETE request is made to `/api/v1/projects/:id` by a user with the `owner` role, THE ProjectsService SHALL delete the Project record and all cascaded child records (project_members, milestones).
2. WHEN a DELETE request is made to `/api/v1/projects/:id` by a user who is not a ProjectMember of that project, THE API SHALL return HTTP 403.
3. WHEN a DELETE request is made to `/api/v1/projects/:id` by a ProjectMember with role `member`, THE API SHALL return HTTP 403.
4. WHEN a project is successfully deleted, THE ActivityLogService SHALL insert an ActivityLog record with `action = 'deleted'` and `entity_type = 'project'`.
5. WHEN the owner confirms deletion from the ProjectDetailPage, THE ProjectDetailPage SHALL call the delete mutation and, on success, navigate the user to the ProjectsPage and invalidate the project list cache.

---

### Requirement 6: Project Member Management

**User Story:** As a project owner, I want to add and remove members from a project, so that I can control who participates in the project.

#### Acceptance Criteria

1. WHEN a POST request is made to `/api/v1/projects/:id/members` with a valid `AddProjectMemberDto` by a user with the `owner` role, THE ProjectsService SHALL insert a ProjectMember record with a UNIQUE constraint on `(project_id, user_id)`.
2. WHEN a POST request is made to `/api/v1/projects/:id/members` for a `(project_id, user_id)` pair that already exists, THE API SHALL return HTTP 409 with a descriptive conflict error message.
3. WHEN a member is successfully added to a project, THE NotificationService SHALL insert a Notification record for the added user with `type = 'update'`, `reference_type = 'project'`, and title `'You have been added to a project'`.
4. WHEN a member is successfully added to a project, THE ActivityLogService SHALL insert an ActivityLog record with `action = 'updated'`, `entity_type = 'project'`, and a description identifying the added user.
5. WHEN a DELETE request is made to `/api/v1/projects/:id/members/:userId` by a user with the `owner` role, THE ProjectsService SHALL delete the ProjectMember record for that `(project_id, userId)` pair.
6. WHEN a DELETE request is made to `/api/v1/projects/:id/members/:userId` where `userId` equals the project owner's user ID, THE API SHALL return HTTP 422 with an error message stating the owner cannot be removed.
7. WHEN a DELETE request is made to `/api/v1/projects/:id/members/:userId` by a user with the `member` role, THE API SHALL return HTTP 403.
8. WHEN a GET request is made to `/api/v1/projects/:id`, THE ProjectsService SHALL include the full `members` array in the response so that the ProjectDetailPage can render the member list.

---

### Requirement 7: Milestone Management

**User Story:** As a project member, I want to create, update, and delete milestones within a project, so that I can define and track phased goals.

#### Acceptance Criteria

1. WHEN a POST request is made to `/api/v1/projects/:id/milestones` with a valid `CreateMilestoneDto` by a ProjectMember of that project, THE ProjectsService SHALL persist a new Milestone record linked to the project, with `status` defaulting to `upcoming` and `progress` defaulting to `0`.
2. WHEN a PATCH request is made to `/api/v1/projects/milestones/:milestoneId` with a valid `UpdateMilestoneDto` by a ProjectMember of the owning project, THE ProjectsService SHALL apply the field changes and return the updated Milestone.
3. WHEN a PATCH request is made to `/api/v1/projects/milestones/:milestoneId` for a non-existent milestone ID, THE API SHALL return HTTP 404 with a descriptive error message.
4. WHEN a DELETE request is made to `/api/v1/projects/milestones/:milestoneId` by a user with the `owner` role of the owning project, THE ProjectsService SHALL delete the Milestone record.
5. WHEN a POST request is made to `/api/v1/projects/:id/milestones` with a missing or empty `title` field, THE API SHALL return HTTP 400 with a validation error message.
6. WHEN a milestone's `status` is set to `completed`, THE ActivityLogService SHALL insert an ActivityLog record with `action = 'completed'` and `entity_type = 'milestone'`.
7. WHEN a milestone's `status` is set to `completed`, THE NotificationService SHALL insert a Notification record for each ProjectMember of the owning project with `type = 'update'` and `reference_type = 'milestone'`.
8. WHEN a POST or PATCH request is made to `/api/v1/projects/:id/milestones` by a user who is not a ProjectMember of that project, THE API SHALL return HTTP 403.

---

### Requirement 8: Progress Auto-Calculation

**User Story:** As a project stakeholder, I want project and milestone progress to be automatically calculated from task completion, so that progress values are always accurate without manual input.

#### Acceptance Criteria

1. WHEN a task's `status` is changed to `done` within a project, THE ProjectsService SHALL recalculate `project.progress` as: `(count of tasks with status='done' in the project) / (total task count in the project) * 100`, rounded to the nearest integer, and persist the updated value.
2. WHEN a task's `status` is changed to `done` and the task belongs to a milestone, THE ProjectsService SHALL recalculate `milestone.progress` as: `(count of tasks with status='done' in the milestone) / (total task count in the milestone) * 100`, rounded to the nearest integer, and persist the updated value.
3. WHEN `milestone.progress` reaches `100`, THE ProjectsService SHALL set `milestone.status` to `completed` and trigger the milestone completion side-effects defined in Requirement 7 (activity log and notifications).
4. WHEN `project.progress` is explicitly set via a PATCH request with `progress` in the `UpdateProjectDto`, THE ProjectsService SHALL persist the provided value and SHALL NOT override it with the auto-calculated value.
5. WHEN there are no tasks in a project, THE ProjectsService SHALL maintain `project.progress = 0`.
6. WHEN there are no tasks in a milestone, THE ProjectsService SHALL maintain `milestone.progress = 0`.

---

### Requirement 9: Frontend API Layer

**User Story:** As a frontend developer, I want a typed API client and React Query hooks for all project endpoints, so that components can fetch and mutate data with consistent error handling and caching.

#### Acceptance Criteria

1. THE ApiClient SHALL be an Axios instance configured with `baseURL` pointing to the backend API and a request interceptor that attaches the authenticated user's Bearer token to the `Authorization` header.
2. WHEN a request fails with HTTP 401, THE ApiClient SHALL redirect the user to the login page.
3. THE useProjects hook SHALL use React Query's `useQuery` with key `['projects']` to fetch from `GET /api/v1/projects` and return `{ data, isLoading, isError, refetch }`.
4. THE useProject hook SHALL use React Query's `useQuery` with key `['project', id]` to fetch from `GET /api/v1/projects/:id` and return `{ data, isLoading, isError }`.
5. THE frontend SHALL expose a `createProject` mutation using React Query's `useMutation` that posts to `POST /api/v1/projects`, and on success SHALL invalidate the `['projects']` query cache.
6. THE frontend SHALL expose an `updateProject` mutation using React Query's `useMutation` that patches `PATCH /api/v1/projects/:id`, and on success SHALL invalidate both `['projects']` and `['project', id]` query caches.
7. THE frontend SHALL expose a `deleteProject` mutation using React Query's `useMutation` that calls `DELETE /api/v1/projects/:id`, and on success SHALL invalidate the `['projects']` query cache.
8. THE frontend SHALL expose an `addMember` mutation that posts to `POST /api/v1/projects/:id/members` and on success SHALL invalidate the `['project', id]` query cache.
9. THE frontend SHALL expose a `removeMember` mutation that calls `DELETE /api/v1/projects/:id/members/:userId` and on success SHALL invalidate the `['project', id]` query cache.
10. THE frontend SHALL expose `createMilestone`, `updateMilestone`, and `removeMilestone` mutations for their respective endpoints, each invalidating the `['project', id]` query cache on success.

---

### Requirement 10: Frontend Routing and Pages

**User Story:** As a user, I want dedicated pages for the project list and project detail, so that I can navigate between projects using the browser's URL bar and history.

#### Acceptance Criteria

1. THE frontend router SHALL define a route at `/projects` that renders the ProjectsPage component.
2. THE frontend router SHALL define a route at `/projects/:id` that renders the ProjectDetailPage component, using the `:id` URL parameter to identify which project to load.
3. WHEN a user navigates to `/projects`, THE ProjectsPage SHALL render the project list fetched via the useProjects hook.
4. WHEN a user clicks a project card on the ProjectsPage, THE router SHALL navigate to `/projects/:id` for that project.
5. WHEN a user navigates to `/`, THE router SHALL redirect to `/projects`.
6. THE ProjectsPage SHALL include a "New Project" button that opens the ProjectForm in a modal or navigates to a create page at `/projects/new`.
7. THE ProjectDetailPage SHALL include an "Edit" button visible only to owners, which opens the ProjectForm pre-populated with the current project data.
8. THE ProjectDetailPage SHALL include a "Delete Project" button visible only to owners, which triggers a confirmation dialog before calling the delete mutation.

---

### Requirement 11: Shared Package Extensions

**User Story:** As a fullstack developer, I want the shared package to expose all response shapes and additional DTOs needed by the frontend, so that both backend and frontend stay in sync on data contracts.

#### Acceptance Criteria

1. THE `@orchest/shared` package SHALL export a `ProjectListItemDto` interface containing at minimum: `id`, `name`, `status`, `priority`, `progress`, `projectType`, `projectMode`, `createdBy`, `startDate`, `endDate`, and `updatedAt`.
2. THE `@orchest/shared` package SHALL export a `ProjectDetailDto` interface that extends `ProjectListItemDto` with `description`, `budget`, `objectives`, `requirements`, `settings`, `members` (array of `ProjectMember`), and `milestones` (array of `Milestone`).
3. THE `@orchest/shared` package SHALL export a `PaginationMeta` interface with `total`, `page`, and `pageSize` fields for future pagination support.
4. WHEN the `@orchest/shared` package is built, THE shared package build SHALL complete without TypeScript errors.
