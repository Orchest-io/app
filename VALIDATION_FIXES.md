# Validation Fixes - Team Selection & Optional Milestones

## Issues Identified
The initial implementation had validation errors:
1. `teamMembers.0.property status should not exist`
2. `teamMembers.0.role must be one of the following values: owner, member`
3. `tasks.0.property assignedTo should not exist`

## Root Causes
1. **Status field**: Was included in team member form but not in DTO
2. **Role field**: Was using job titles (e.g., "Full Stack Engineer") instead of enum values ("owner" | "member")
3. **AssignedTo field**: Was included in task form but not in DTO

## Fixes Applied

### 1. Backend DTOs (`shared/src/dtos/project.dtos.ts`)

**CreateProjectMemberDto**:
```typescript
export class CreateProjectMemberDto {
  @IsString()
  email: string;

  @IsOptional()
  @IsEnum(ProjectMemberRole)  // Must be 'owner' or 'member'
  role?: ProjectMemberRole;

  @IsOptional()
  @IsString()
  jobTitle?: string;  // For display purposes (e.g., "Frontend Developer")

  @IsOptional()
  @IsString()
  skills?: string;
  
  // ❌ REMOVED: status field
}
```

**CreateProjectTaskDto**:
```typescript
export class CreateProjectTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsUUID()
  milestoneId?: string;  // Optional milestone
  
  // ❌ REMOVED: assignedTo field
}
```

### 2. Frontend State (`CreateProjectWizard.tsx`)

**Team Members State**:
```typescript
const [teamMembers, setTeamMembers] = useState<Array<{ 
  email: string
  role: 'owner' | 'member'  // Enum values only
  jobTitle?: string          // Optional display field
  skills?: string
}>>([])
```

**Member Form State**:
```typescript
const [memberForm, setMemberForm] = useState({ 
  email: '', 
  role: 'member' as 'owner' | 'member',  // Default to 'member'
  jobTitle: '',
  skills: ''
  // ❌ REMOVED: status field
})
```

**Task State**:
```typescript
const [tasks, setTasks] = useState<Array<{ 
  title: string
  description: string
  priority: string
  dueDate: string
  status: string
  milestoneId?: string  // Optional
}>>([])
```

**Task Form State**:
```typescript
const [taskForm, setTaskForm] = useState({ 
  title: '', 
  description: '', 
  priority: 'medium',
  dueDate: '',
  status: 'todo',
  milestoneId: ''
  // ❌ REMOVED: assignedTo field
})
```

### 3. Team Member Modal Updates

**Role Selection** (Changed from job titles to enum values):
```tsx
<Select
  label={t('wizard.projectRole')}
  value={memberForm.role}
  onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value as 'owner' | 'member' })}
  options={[
    { value: 'member', label: t('wizard.roleMember', { defaultValue: 'Member' }) },
    { value: 'owner', label: t('wizard.roleOwner', { defaultValue: 'Owner' }) },
  ]}
  required
/>

<Input
  label={t('wizard.jobTitle', { defaultValue: 'Job Title' })}
  placeholder="e.g. Full Stack Engineer, Backend Developer"
  value={memberForm.jobTitle}
  onChange={(e) => setMemberForm({ ...memberForm, jobTitle: e.target.value })}
  helperText={t('wizard.jobTitleHelper', { defaultValue: 'Optional: Their role/position in the team' })}
/>
```

**Status Field**: ❌ Completely removed

### 4. Task Modal Updates

**Removed assignedTo field**:
```tsx
// ❌ REMOVED:
<Input
  label={t('wizard.taskAssignTo')}
  type="email"
  value={taskForm.assignedTo}
  ...
/>
```

**Made dueDate optional** (removed `required` attribute):
```tsx
<Input
  label={t('wizard.taskDueDate')}
  type="date"
  value={taskForm.dueDate}
  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
  // Not required anymore
/>
```

### 5. Display Updates

**Team Member Display**:
```tsx
<p className="text-sm font-medium text-on-surface">{member.email}</p>
<p className="text-xs text-on-surface-variant">
  {member.jobTitle || (member.role === 'owner' ? 'Owner' : 'Member')} 
  {member.skills && `• ${member.skills}`}
</p>
// ❌ REMOVED: Status badge display
```

**Task Display**:
```tsx
<div className="flex items-center gap-3 mt-1 text-xs text-on-surface-variant">
  {task.dueDate && (
    <span className="flex items-center gap-1">
      <span className="material-symbols-outlined text-[12px]">schedule</span>
      {task.dueDate}
    </span>
  )}
  <span className="flex items-center gap-1">
    <span className="material-symbols-outlined text-[12px]">flag</span>
    {task.priority}
  </span>
</div>
// ❌ REMOVED: assignedTo display
```

## Data Flow

### Correct Flow:
```
Frontend Form → Validation → API Request
{
  email: "user@example.com",
  role: "member",              // ✅ Enum value
  jobTitle: "Frontend Dev",    // ✅ Display field
  skills: "React, TypeScript"  // ✅ Optional
}
```

### Backend Processing:
```typescript
// projects.service.ts
const newMember = manager.create(ProjectMember, {
  projectId: savedProject.id,
  userId: user.id,
  role: teamMember.role || ProjectMemberRole.MEMBER,  // ✅ Uses enum
  jobTitle: teamMember.jobTitle,  // ✅ Stored for display
  skills: teamMember.skills,
});
```

## Key Differences

| Field | Before | After |
|-------|--------|-------|
| **Team Member Role** | Free text (job titles) | Enum: 'owner' \| 'member' |
| **Job Title** | Stored in `role` | Separate `jobTitle` field |
| **Member Status** | 'available' \| 'busy' \| 'on-leave' | ❌ Removed |
| **Task AssignedTo** | Email string | ❌ Removed |
| **Task Due Date** | Required | Optional |

## Testing

### Valid Team Member Data:
```json
{
  "email": "dev@example.com",
  "role": "member",
  "jobTitle": "Full Stack Developer",
  "skills": "React, Node.js"
}
```

### Valid Task Data:
```json
{
  "title": "Setup authentication",
  "description": "Implement JWT auth",
  "priority": "high",
  "status": "todo",
  "dueDate": "2024-12-31"
  // milestoneId is optional
}
```

## Why These Changes?

1. **Separation of Concerns**: 
   - `role` = Access level (enum for permissions)
   - `jobTitle` = Display name (free text for UI)

2. **Simplification**: 
   - Removed `status` - can be added later if truly needed
   - Removed `assignedTo` - task assignment should be done after project creation

3. **Validation Compliance**:
   - DTO validation now passes
   - Enum values are properly typed
   - No extra fields sent to backend

## Build Status
✅ Shared package builds successfully
✅ Backend builds successfully
✅ Frontend builds successfully
✅ All TypeScript errors resolved
