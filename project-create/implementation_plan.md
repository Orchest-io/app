# Move Add Members Step and Update Task Modal in Project Wizard

This plan details the changes required to adjust the multi-step project creation wizard in `CreateProjectWizard.tsx`:
1. Move the **Add Team Members** card from the **Plan** step (Step 4) to its own step (Step 4) before the **Plan** step (Step 5) in manual project creation.
2. Update the **Add Task Modal** inside the wizard to:
   - Provide a milestone assignment dropdown (including "Without milestone" as default).
   - Resolve local milestone references to backend-assigned UUIDs during project/task generation.
   - Change the assignee input from an email text field to a select dropdown containing only the added team members and the logged-in user.

## User Review Required

> [!IMPORTANT]
> - For **Individual Projects**, we will skip the Team Members step entirely and proceed directly from Basic Info (Step 3) to Plan (Step 4).
> - We will add a new key `"stepMembers"` to the translations in both English (`en.json`) and Arabic (`ar.json`) for localization compatibility.

## Proposed Changes

### Frontend Components

#### [MODIFY] [CreateProjectWizard.tsx](file:///d:/CS/ITI-MERN/Final-Proj/Orchest/app/frontend/src/pages/Projects/CreateProjectWizard.tsx)
- Add `milestoneTitle` to the `tasks` state and `taskForm` state.
- Update `stepIndicator` to display 5 steps for team projects: Mode (1), Type (2), Details (3), Members (4), Plan (5).
- For individual projects, keep 4 steps: Mode (1), Type (2), Details (3), Plan (4).
- Extract the Team Members card/form section from `renderPlanningDetails` and create a dedicated `renderTeamMembersStep` function.
- Update wizard routing logic (`step` transitions) to include the new Members step for team projects, while skipping it for individual projects.
- In the **Add Task Modal**:
  - Replace the "Assign To" text input with a `Select` dropdown.
  - Load option list from `teamMembers` (resolved against system users) plus the currently logged-in user.
  - Add a "Milestone" `Select` dropdown populated with currently defined local milestones, defaulting to "Without Milestone".
- In `handleFinalCreate`:
  - Keep track of the database IDs of created milestones by mapping their titles.
  - Resolve the selected local `milestoneTitle` to the created milestone's database `id` and include it in the `/tasks` creation API payload.
  - Call the task assignee endpoint `/tasks/${taskId}/assignees` to assign the selected user if applicable.

#### [MODIFY] [en.json](file:///d:/CS/ITI-MERN/Final-Proj/Orchest/app/frontend/src/locales/en.json)
- Add `"stepMembers": "Members"` under `wizard`.

#### [MODIFY] [ar.json](file:///d:/CS/ITI-MERN/Final-Proj/Orchest/app/frontend/src/locales/ar.json)
- Add `"stepMembers": "الأعضاء"` under `wizard`.

## Verification Plan

### Manual Verification
1. Run the app locally and open the Project Wizard.
2. Select **Manual Planning** and **Team Project**.
3. Fill out the details (Step 3) and verify clicking "Continue" navigates to the new **Members** step (Step 4).
4. Add a team member, then click "Continue" to navigate to the **Plan** step (Step 5).
5. Add a milestone in the Milestones section.
6. Click "Add Task" and verify:
   - The milestone dropdown includes "Without Milestone" (selected by default) and the milestone just added.
   - The "Assign To" dropdown includes the logged-in user and the added team member.
7. Select the milestone and assignee, and add the task.
8. Click "Create Project" and verify the project, milestones, and tasks are created on the server without errors, with proper milestone/assignee relations.
9. Try creating an **Individual Project** and verify the **Members** step is skipped.
