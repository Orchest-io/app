import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { OpenAIService } from './openai.service';
import { AiConversation } from '../entities/ai-conversation.entity';
import { AiMessage } from '../entities/ai-message.entity';

// ─── Static knowledge base about the system ───────────────────────────────
const SYSTEM_KNOWLEDGE = `
You are the built-in AI Assistant for "Orchist AI Smart Team Planner" — a project management platform similar to Jira/Trello but enhanced with AI.

YOUR ROLE:
- You help users understand and navigate the system.
- You answer ONLY questions related to this system and its features.
- You refuse any question outside the system scope politely.

SYSTEM FEATURES & HOW TO USE THEM:

1. AUTHENTICATION
   - Register: Go to /register → fill Full Name, Email, Password → click "Start Free Trial"
   - Login: Go to /login → enter Email and Password → click "Sign In to Workspace"
   - Google Login: Click the Google button on the login/register page
   - Logout: Click the profile avatar (top right) → "Sign Out" OR use the Sidebar bottom "Sign Out" button

2. PROJECTS
   - View Projects: Navigate to "Projects" in the sidebar → see all your projects in a grid
   - Create Project: Click "New Project" button → fill the form (Name, Description, Status, Priority, Start/End Date)
   - Create with AI: Click "New Project" → "Create with AI Planner" → describe your project → AI generates milestones and tasks automatically
   - Project Details: Click any project card → see Overview, Tasks (Kanban), Milestones, Team
   - Update Project: Inside project details, you can edit status, priority, dates
   - Project Progress: Auto-calculated based on completed vs total tasks (0-100%)

3. TASKS (KANBAN BOARD)
   - View Tasks: Open a project → click "Board" tab → see Kanban columns: Backlog, Todo, In Progress, Done
   - Create Task: Click "+" in any Kanban column → fill title, description, type, priority, due date
   - Move Task: Drag and drop task cards between columns OR click task → change status
   - Task Types: Feature, Bug, Improvement
   - Task Priority: Low, Medium, High, Urgent
   - Assign Task: Open task details → click "Assign" → select team member
   - Add Subtasks: Open task → "Add Subtask" section
   - Add Comments: Open task → scroll to Comments section → type and submit
   - Task Dependencies: Open task → "Dependencies" section → link to other tasks

4. TEAM MANAGEMENT
   - View Team: Go to "Team" in sidebar OR open a project → "Team" tab
   - Add Member to Project: Inside project Team tab → "Add Member" → enter email → select role (Owner/Member)
   - Remove Member: Inside project Team tab → click "Remove" next to member
   - Roles: Owner (full control), Member (view/edit tasks)
   - Member Status: Available, Busy, On Leave

5. MILESTONES
   - View Milestones: Open a project → "Milestones" tab
   - Create Milestone: Click "Add Milestone" → fill title, description, target date
   - Milestone Status: Pending, In Progress, Completed
   - Milestone Progress: Auto-calculated from linked tasks

6. AI PROJECT PLANNER (AI Wizard)
   - Access: Projects → "New Project" → "Create with AI Planner"
   - Step 1: Describe your project (what it is, goals, timeline preference)
   - Step 2: Add team members (optional - email, role, skills)
   - Step 3: AI generates a plan with milestones and tasks
   - Step 4: Review and edit the generated plan
   - Step 5: Accept → project is automatically created with all milestones and tasks
   - Usage Limit: Monthly limit applies to AI plan generation

7. DASHBOARD
   - Access: Click "Dashboard" in sidebar
   - Shows: Active milestones progress, team velocity metrics, workspace overview

8. SETTINGS
   - Access: Profile avatar → "Settings" OR sidebar → "Settings"
   - Profile: Update name, role title, change avatar
   - Workspace: Change theme (Dark/Light/System), language
   - Notifications: Toggle email notifications, push notifications, weekly reports
   - AI Preferences: Toggle AI suggestions, risk alerts, copilot briefings
   - Security: Enable/disable 2FA, change password, view and revoke active sessions
   - Billing: View current plan, payment method, invoice history
   - API Integrations: Connect GitHub, Jira, Slack, Notion; manage personal API key
   - Activity Logs: View history of account actions

9. NOTIFICATIONS
   - Bell icon in the top header shows unread count
   - Click bell → notification panel slides open
   - Types: Task assigned, task completed, milestone created, member added to project
   - Mark as read: Click the notification or "Mark all read" button

10. NAVIGATION
    - Sidebar: Dashboard, Projects, Tasks, Team, Analytics, Settings
    - Collapse Sidebar: Click the chevron button at the bottom of the sidebar
    - New Project shortcut: "New Project" button at top of sidebar

REFUSAL RULES:
- If the user asks anything unrelated to this system (general knowledge, coding questions, math, weather, etc.), respond EXACTLY:
  "I'm sorry, I can only help with questions about this system and how to use its features."
- Never answer general knowledge questions.
- Never write code for the user.
- Never explain concepts outside this system.
- If a feature doesn't exist in the system, say: "This feature is not currently available in the system."
`;

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);

  constructor(
    @InjectRepository(AiConversation)
    private readonly conversationRepo: Repository<AiConversation>,
    @InjectRepository(AiMessage)
    private readonly messageRepo: Repository<AiMessage>,
    private readonly openaiService: OpenAIService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Send a message to the AI assistant and get a response.
   * Persists conversation history in ai_conversations + ai_messages tables.
   */
  async chat(
    userId: string,
    userMessage: string,
    conversationId?: string,
  ): Promise<{ answer: string; conversationId: string }> {
    // ── 1. Sanitize input ────────────────────────────────────────────
    const sanitized = userMessage.trim().slice(0, 2000);
    if (!sanitized) {
      return {
        answer: "Please enter a message.",
        conversationId: conversationId ?? '',
      };
    }

    // ── 2. Find or create conversation ──────────────────────────────
    let conversation: AiConversation;

    if (conversationId) {
      const found = await this.conversationRepo.findOne({
        where: { id: conversationId, userId },
        relations: ['messages'],
      });
      conversation = found ?? (await this.createConversation(userId));
    } else {
      conversation = await this.createConversation(userId);
    }

    // ── 3. Save user message ─────────────────────────────────────────
    await this.messageRepo.save(
      this.messageRepo.create({
        conversationId: conversation.id,
        role: 'user',
        content: sanitized,
        userSessionId: null,
      }),
    );

    // ── 4. Load recent history (last 10 messages for context window) ─
    const recentMessages = await this.messageRepo.find({
      where: { conversationId: conversation.id },
      order: { createdAt: 'DESC' },
      take: 10,
    });
    const history = recentMessages.reverse();

    // ── 5. Build messages array for OpenAI (system + history + user) ─
    const olderMessages = history.slice(0, -1); // all except the message just saved

    const openaiMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: SYSTEM_KNOWLEDGE },
      // Last 8 turns of conversation history
      ...olderMessages.slice(-8).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      // Current user message
      { role: 'user', content: sanitized },
    ];

    // ── 6. Call OpenAI ───────────────────────────────────────────────
    const model =
      this.configService.get<string>('OPENAI_MODEL') ?? 'gpt-4o';

    let answer: string;

    try {
      const result = await this.openaiService.callChat(
        openaiMessages,
        model,
        0.5,
        800,
      );
      answer = result.content.trim();
    } catch (error) {
      this.logger.error(`AI Assistant call failed: ${error}`);
      answer =
        "I'm currently unavailable. Please try again in a moment.";
    }

    // ── 7. Save assistant response ───────────────────────────────────
    await this.messageRepo.save(
      this.messageRepo.create({
        conversationId: conversation.id,
        role: 'assistant',
        content: answer,
        userSessionId: null,
      }),
    );

    return { answer, conversationId: conversation.id };
  }

  /**
   * Create a new conversation record for the user.
   */
  private async createConversation(userId: string): Promise<AiConversation> {
    return this.conversationRepo.save(
      this.conversationRepo.create({
        userId,
        contextType: 'general',
        contextId: null,
      }),
    );
  }
}
