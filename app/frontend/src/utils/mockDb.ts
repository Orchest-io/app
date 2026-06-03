export type User = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
};

export type ProjectMember = {
  id: string;
  projectId: string;
  userId: string;
  role?: string;
  joinedAt: string;
  user?: User;
};

export type Milestone = {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status?: string;
  progress: number;
  targetDate?: string;
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  priority: string;
  dueDate?: string;
};

export type ActivityLog = {
  id: string;
  projectId: string;
  action: string;
  entityType: string;
  description: string;
  createdAt: string;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  startDate?: string;
  endDate?: string;
  members?: ProjectMember[];
  milestones?: Milestone[];
  tasks?: Task[];
  activityLogs?: ActivityLog[];
};

// Initial Data
const DEFAULT_USERS: User[] = [
  { id: 'u1', fullName: 'Sarah Connor', email: 'sarah@orchest.io' },
  { id: 'u2', fullName: 'John Doe', email: 'john@orchest.io' },
  { id: 'u3', fullName: 'Jane Smith', email: 'jane@orchest.io' },
  { id: 'u4', fullName: 'Ahmed Ali', email: 'ahmed@orchest.io' },
];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Orchest Platform Redesign',
    description: 'Revamping the workspace experience with a focus on speed, modern typography, glassmorphism UI, and real-time collaboration tools.',
    status: 'active',
    priority: 'high',
    progress: 68,
    startDate: '2026-04-01',
    endDate: '2026-07-15',
  },
  {
    id: 'p2',
    name: 'AI-Assisted Estimation Module',
    description: 'Building predictive modeling for task difficulty estimation, resources mapping, and timeline warning insights.',
    status: 'planning',
    priority: 'medium',
    progress: 12,
    startDate: '2026-05-15',
    endDate: '2026-08-30',
  },
  {
    id: 'p3',
    name: 'Database Migration to PostgreSQL',
    description: 'Transitioning all schemas, relations, and stored procedures from old databases to PostgreSQL database for reliability.',
    status: 'completed',
    priority: 'high',
    progress: 100,
    startDate: '2026-03-01',
    endDate: '2026-05-01',
  },
  {
    id: 'p4',
    name: 'Mobile Companion Application',
    description: 'Creating a React Native app wrapper to access project boards, chat, and check status on the go.',
    status: 'archived',
    priority: 'low',
    progress: 45,
    startDate: '2025-10-01',
    endDate: '2026-02-28',
  },
];

const DEFAULT_MEMBERS: ProjectMember[] = [
  { id: 'm1', projectId: 'p1', userId: 'u1', role: 'Product Owner', joinedAt: '2026-04-01T10:00:00Z' },
  { id: 'm2', projectId: 'p1', userId: 'u3', role: 'Lead UI/UX Designer', joinedAt: '2026-04-02T11:30:00Z' },
  { id: 'm3', projectId: 'p1', userId: 'u4', role: 'Fullstack Developer', joinedAt: '2026-04-05T09:00:00Z' },
  { id: 'm4', projectId: 'p2', userId: 'u1', role: 'Product Owner', joinedAt: '2026-05-15T10:00:00Z' },
  { id: 'm5', projectId: 'p2', userId: 'u2', role: 'Senior Backend Engineer', joinedAt: '2026-05-16T14:00:00Z' },
];

const DEFAULT_TASKS: Task[] = [
  {
    id: 't1',
    projectId: 'p1',
    title: 'Design Glassmorphism Dashboard Mockup',
    description: 'Deliver the high-fidelity UI/UX design components containing gradients and glowing progress bars.',
    type: 'improvement',
    status: 'done',
    priority: 'high',
    dueDate: '2026-05-10',
  },
  {
    id: 't2',
    projectId: 'p1',
    title: 'Implement Dark Mode / Light Mode Theme Switching',
    description: 'Configure Vite CSS variables to dynamically toggle between curated dark & light mode palettes.',
    type: 'feature',
    status: 'in-progress',
    priority: 'medium',
    dueDate: '2026-05-28',
  },
  {
    id: 't3',
    projectId: 'p1',
    title: 'Refactor Sidebar Layout for Collapsed State',
    description: 'Ensure proper responsiveness of the workspace sidebar for tablet and mobile screens.',
    type: 'improvement',
    status: 'todo',
    priority: 'low',
    dueDate: '2026-06-05',
  },
  {
    id: 't4',
    projectId: 'p1',
    title: 'Fix Mobile Navigation Menu Glitch',
    description: 'Resolve touch target conflicts on hamburger layout triggers.',
    type: 'bug',
    status: 'backlog',
    priority: 'urgent',
    dueDate: '2026-05-25',
  },
];

const DEFAULT_MILESTONES: Milestone[] = [
  {
    id: 'ms1',
    projectId: 'p1',
    title: 'Phase 1: High Fidelity Mockups',
    description: 'Deliver approved Figma designs for core dashboards.',
    progress: 100,
    targetDate: '2026-05-12',
  },
  {
    id: 'ms2',
    projectId: 'p1',
    title: 'Phase 2: Core Frontend Integration',
    description: 'Integrate Vite frontend modules and routes.',
    progress: 60,
    targetDate: '2026-06-15',
  },
  {
    id: 'ms3',
    projectId: 'p1',
    title: 'Phase 3: Live Launch',
    description: 'Deploy the redesigned workspace to production.',
    progress: 0,
    targetDate: '2026-07-15',
  },
];

const DEFAULT_LOGS: ActivityLog[] = [
  {
    id: 'l1',
    projectId: 'p1',
    action: 'update_task',
    entityType: 'task',
    description: "Jane Smith updated task 'Design Glassmorphism Dashboard Mockup' to Completed",
    createdAt: '2026-05-22T14:30:00.000Z',
  },
  {
    id: 'l2',
    projectId: 'p1',
    action: 'add_member',
    entityType: 'project',
    description: 'Ahmed Ali joined the project as Fullstack Developer',
    createdAt: '2026-05-22T10:15:00.000Z',
  },
  {
    id: 'l3',
    projectId: 'p1',
    action: 'create_milestone',
    entityType: 'milestone',
    description: "Sarah Connor created milestone 'Phase 2: Core Frontend Integration'",
    createdAt: '2026-05-21T09:00:00.000Z',
  },
];

// LocalStorage helpers
function getStored<T>(key: string, defaultValue: T): T {
  const val = localStorage.getItem(key);
  if (!val) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(val);
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Database APIs
export const mockDb = {
  getUsers: (): User[] => {
    return getStored<User[]>('orchest_users', DEFAULT_USERS);
  },

  getProjects: (): Project[] => {
    const projects = getStored<Project[]>('orchest_projects', DEFAULT_PROJECTS);
    const tasks = getStored<Task[]>('orchest_tasks', DEFAULT_TASKS);
    
    // Dynamically calculate progress based on tasks for realistic dashboard statistics
    return projects.map((p) => {
      const pTasks = tasks.filter((t) => t.projectId === p.id);
      if (pTasks.length > 0) {
        const completed = pTasks.filter((t) => t.status === 'done').length;
        p.progress = Math.round((completed / pTasks.length) * 100);
      }
      return p;
    });
  },

  getProject: (id: string): Project | null => {
    const projects = mockDb.getProjects();
    const project = projects.find((p) => p.id === id);
    if (!project) return null;

    const allMembers = getStored<ProjectMember[]>('orchest_members', DEFAULT_MEMBERS);
    const allTasks = getStored<Task[]>('orchest_tasks', DEFAULT_TASKS);
    const allMilestones = getStored<Milestone[]>('orchest_milestones', DEFAULT_MILESTONES);
    const allLogs = getStored<ActivityLog[]>('orchest_activity_logs', DEFAULT_LOGS);
    const allUsers = mockDb.getUsers();

    const members = allMembers
      .filter((m) => m.projectId === id)
      .map((m) => ({
        ...m,
        user: allUsers.find((u) => u.id === m.userId),
      }));

    const tasks = allTasks.filter((t) => t.projectId === id);
    const milestones = allMilestones.filter((m) => m.projectId === id);
    const activityLogs = allLogs.filter((l) => l.projectId === id);

    // Update status and calculate details progress
    if (tasks.length > 0) {
      const completed = tasks.filter((t) => t.status === 'done').length;
      project.progress = Math.round((completed / tasks.length) * 100);
    }

    return {
      ...project,
      members,
      tasks,
      milestones,
      activityLogs: activityLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    };
  },

  createProject: (dto: Omit<Project, 'id' | 'progress'>): Project => {
    const projects = getStored<Project[]>('orchest_projects', DEFAULT_PROJECTS);
    const newProj: Project = {
      ...dto,
      id: 'p_' + Math.random().toString(36).substr(2, 9),
      progress: 0,
    };
    projects.push(newProj);
    setStored('orchest_projects', projects);

    // Automatically add current logged in user as Owner of new project
    const members = getStored<ProjectMember[]>('orchest_members', DEFAULT_MEMBERS);
    members.push({
      id: 'm_' + Math.random().toString(36).substr(2, 9),
      projectId: newProj.id,
      userId: 'u1', // Default owner
      role: 'Owner',
      joinedAt: new Date().toISOString(),
    });
    setStored('orchest_members', members);

    // Add log
    mockDb.logActivity(newProj.id, 'create_project', 'project', `Project '${newProj.name}' was created.`);

    return newProj;
  },

  updateProject: (id: string, dto: Partial<Project>): Project => {
    const projects = getStored<Project[]>('orchest_projects', DEFAULT_PROJECTS);
    const idx = projects.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Project not found');

    projects[idx] = { ...projects[idx], ...dto };
    setStored('orchest_projects', projects);

    mockDb.logActivity(id, 'update_project', 'project', `Project details were updated.`);

    return projects[idx];
  },

  addProjectMember: (projectId: string, userId: string, role: string): ProjectMember => {
    const members = getStored<ProjectMember[]>('orchest_members', DEFAULT_MEMBERS);
    const users = mockDb.getUsers();
    const user = users.find((u) => u.id === userId);

    const newMember: ProjectMember = {
      id: 'm_' + Math.random().toString(36).substr(2, 9),
      projectId,
      userId,
      role,
      joinedAt: new Date().toISOString(),
    };
    members.push(newMember);
    setStored('orchest_members', members);

    mockDb.logActivity(
      projectId,
      'add_member',
      'project',
      `${user?.fullName || 'A new user'} was added as ${role}.`
    );

    return { ...newMember, user };
  },

  createTask: (dto: Omit<Task, 'id'>): Task => {
    const tasks = getStored<Task[]>('orchest_tasks', DEFAULT_TASKS);
    const newTask: Task = {
      ...dto,
      id: 't_' + Math.random().toString(36).substr(2, 9),
    };
    tasks.push(newTask);
    setStored('orchest_tasks', tasks);

    mockDb.logActivity(
      dto.projectId,
      'create_task',
      'task',
      `Task '${newTask.title}' was created under this project.`
    );

    return newTask;
  },

  createMilestone: (dto: Omit<Milestone, 'id'>): Milestone => {
    const milestones = getStored<Milestone[]>('orchest_milestones', DEFAULT_MILESTONES);
    const newMs: Milestone = {
      ...dto,
      id: 'ms_' + Math.random().toString(36).substr(2, 9),
    };
    milestones.push(newMs);
    setStored('orchest_milestones', milestones);

    mockDb.logActivity(
      dto.projectId,
      'create_milestone',
      'milestone',
      `Milestone '${newMs.title}' was added.`
    );

    return newMs;
  },

  logActivity: (projectId: string, action: string, entityType: string, description: string): void => {
    const logs = getStored<ActivityLog[]>('orchest_activity_logs', DEFAULT_LOGS);
    logs.push({
      id: 'l_' + Math.random().toString(36).substr(2, 9),
      projectId,
      action,
      entityType,
      description,
      createdAt: new Date().toISOString(),
    });
    setStored('orchest_activity_logs', logs);
  },
};
