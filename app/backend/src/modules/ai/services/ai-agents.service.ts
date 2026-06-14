import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { AiRagService } from './ai-rag.service';
import { GeneratedMilestone, GeneratedTask, TeamMemberInput } from '@orchest/shared';

@Injectable()
export class AiAgentsService {
  private readonly logger = new Logger(AiAgentsService.name);

  constructor(
    private openAIService: OpenAIService,
    private aiRagService: AiRagService,
  ) {}

  /**
   * PLANNING AGENT - Heavy reasoning tasks
   * Uses gpt-5-mini (strongest available model)
   */
  async planningAgent(prompt: string): Promise<any> {
    try {
      const { content, tokensUsed } = await this.openAIService.callChatCompletion(
        prompt,
        'gpt-5-mini',
        0.7,
        4000,
      );

      return {
        data: this.openAIService.parseJsonResponse(content),
        tokensUsed,
        modelUsed: 'gpt-5-mini',
      };
    } catch (error) {
      // Fallback to gpt-4o-mini if gpt-5-mini fails
      this.logger.warn('gpt-5-mini failed, falling back to gpt-4o-mini');
      const { content, tokensUsed } = await this.openAIService.callChatCompletion(
        prompt,
        'gpt-4o-mini',
        0.7,
        4000,
      );

      return {
        data: this.openAIService.parseJsonResponse(content),
        tokensUsed,
        modelUsed: 'gpt-4o-mini',
      };
    }
  }

  /**
   * VALIDATION AGENT - Quick checks and validation
   * Uses gpt-4o-mini (fast and reliable)
   */
  async validationAgent(prompt: string): Promise<any> {
    const { content, tokensUsed } = await this.openAIService.callChatCompletion(
      prompt,
      'gpt-4o-mini',
      0.5,
      2000,
    );

    return {
      data: this.openAIService.parseJsonResponse(content),
      tokensUsed,
      modelUsed: 'gpt-4o-mini',
    };
  }

  /**
   * STAGE 1: Analyze Project Context
   * Uses RAG to retrieve similar past projects for better context
   */
  async analyzeProjectContext(
    description: string,
    userId: string,
    goals?: string,
    timelinePreference?: string,
  ): Promise<{
    projectType: string;
    complexity: 'low' | 'medium' | 'high';
    suggestedDuration: string;
    keyFeatures: string[];
    tokensUsed: number;
  }> {
    const ragContext = await this.aiRagService.formatContextForPrompt(
      [description, goals].filter(Boolean).join('\n'),
      userId,
    );

    const prompt = `You are a senior project manager analyzing a new project request.

Project Description:
${description}

${goals ? `Goals:\n${goals}` : ''}

${timelinePreference ? `Timeline Preference: ${timelinePreference}` : ''}
${ragContext}

Analyze this project and respond in JSON format:
{
  "projectType": "string (e.g., web app, mobile app, API, etc.)",
  "complexity": "low" | "medium" | "high",
  "suggestedDuration": "string (e.g., '8 weeks', '3 months')",
  "keyFeatures": ["feature1", "feature2", ...]
}`;

    const result = await this.planningAgent(prompt);
    return { ...result.data, tokensUsed: result.tokensUsed };
  }

  /**
   * STAGE 2: Generate Milestones
   * Uses RAG to retrieve similar project milestones for reference
   */
  async generateMilestones(
    context: {
      description: string;
      projectType: string;
      complexity: string;
      keyFeatures: string[];
      suggestedDuration: string;
    },
    userId: string,
  ): Promise<{ milestones: GeneratedMilestone[]; tokensUsed: number }> {
    const ragContext = await this.aiRagService.formatContextForPrompt(
      `${context.projectType} project: ${context.description}`,
      userId,
    );

    const prompt = `You are a senior project manager creating project milestones.

Project Context:
- Type: ${context.projectType}
- Complexity: ${context.complexity}
- Duration: ${context.suggestedDuration}
- Key Features: ${context.keyFeatures.join(', ')}

Description:
${context.description}
${ragContext}

Create 3-7 logical milestones for this project. Each milestone should represent a major phase or deliverable.

Respond in JSON format:
{
  "milestones": [
    {
      "title": "string",
      "description": "string",
      "estimatedWeeks": number,
      "order": number (1-based),
      "tasks": []
    }
  ]
}`;

    const result = await this.planningAgent(prompt);
    return { milestones: result.data.milestones, tokensUsed: result.tokensUsed };
  }

  /**
   * STAGE 3: Generate Tasks for Milestone
   * Uses RAG to retrieve task estimates from similar milestones
   */
  async generateTasksForMilestone(
    milestone: GeneratedMilestone,
    context: any,
    userId: string,
  ): Promise<{ tasks: GeneratedTask[]; tokensUsed: number }> {
    const ragContext = await this.aiRagService.formatContextForPrompt(
      `${milestone.title}: ${milestone.description}`,
      userId,
    );

    const prompt = `You are a technical lead breaking down a project milestone into actionable tasks.

Milestone: ${milestone.title}
Description: ${milestone.description}
Project Type: ${context.projectType}
Complexity: ${context.complexity}
${ragContext}

Create 3-12 specific, actionable tasks for this milestone.

For each task, provide:
- title: Clear, action-oriented title
- description: Technical details
- type: "feature" | "bug" | "improvement"
- priority: "low" | "medium" | "high" | "urgent"
- estimatedHours: Realistic estimate (1-40 hours)
- riskLevel: "low" | "medium" | "high" (probability of issues)
- complexity: "simple" | "medium" | "complex" (technical difficulty)
- requiredSkills: Array of technical skills needed
- dependencies: Array of task titles this depends on (empty if none)

Respond in JSON format:
{
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "type": "feature" | "bug" | "improvement",
      "priority": "low" | "medium" | "high" | "urgent",
      "estimatedHours": number,
      "riskLevel": "low" | "medium" | "high",
      "complexity": "simple" | "medium" | "complex",
      "requiredSkills": ["skill1", "skill2"],
      "dependencies": []
    }
  ]
}`;

    const result = await this.planningAgent(prompt);
    return { tasks: result.data.tasks, tokensUsed: result.tokensUsed };
  }

  /**
   * STAGE 4: Suggest Task Assignments
   * Uses gpt-4o-mini for fast, efficient matching
   */
  async suggestTaskAssignments(
    tasks: GeneratedTask[],
    teamMembers?: TeamMemberInput[],
  ): Promise<{ tasks: GeneratedTask[]; tokensUsed: number }> {
    if (!teamMembers || teamMembers.length === 0) {
      // No team members - just suggest required roles
      return { tasks, tokensUsed: 0 };
    }

    const prompt = `You are an engineering manager assigning tasks to team members.

Team Members:
${teamMembers.map((m) => `
- ${m.name} (${m.email})
  Role: ${m.jobTitle}
  Skills: ${m.skills}
  Availability: ${m.availability || 'full-time'}
`).join('\n')}

Tasks to Assign:
${tasks.map((t, i) => `
${i + 1}. ${t.title}
   Required Skills: ${t.requiredSkills.join(', ')}
   Complexity: ${t.complexity}
   Risk: ${t.riskLevel}
   Estimated Hours: ${t.estimatedHours}
`).join('\n')}

For each task, suggest the BEST team member based on:
1. Skills match (most important)
2. Availability
3. Workload balance (don't overload one person)
4. Complexity match (complex tasks to experienced members)

Respond in JSON format:
{
  "assignments": [
    {
      "taskTitle": "string (exact match)",
      "suggestedMember": "email",
      "matchScore": number (0-100),
      "reason": "string (1 sentence)"
    }
  ]
}`;

    // Use gpt-4o-mini for fast assignments
    const { content, tokensUsed } = await this.openAIService.callChatCompletion(
      prompt,
      'gpt-4o-mini',
      0.6,
      2000,
    );
    
    const result = {
      data: this.openAIService.parseJsonResponse(content),
      tokensUsed,
      modelUsed: 'gpt-4o-mini',
    };
    
    // Apply suggestions to tasks
    const assignments = (result.data as any).assignments;
    const updatedTasks = tasks.map((task) => {
      const assignment = assignments.find((a: any) => a.taskTitle === task.title);
      if (assignment) {
        const member = teamMembers.find((m) => m.email === assignment.suggestedMember);
        return {
          ...task,
          suggestedAssignee: {
            email: assignment.suggestedMember,
            name: member?.name,
            reason: assignment.reason,
            matchScore: assignment.matchScore,
          },
        };
      }
      return task;
    });

    return { tasks: updatedTasks, tokensUsed: result.tokensUsed };
  }

  /**
   * STAGE 5: Validate and Optimize Plan
   */
  async validatePlan(plan: any, userId: string): Promise<{
    isValid: boolean;
    warnings: string[];
    suggestions: string[];
    tokensUsed: number;
  }> {
    const ragContext = await this.aiRagService.formatContextForPrompt(
      `Project validation: ${plan.estimatedDuration}, ${plan.complexity} complexity, ${plan.totalTasks} tasks`,
      userId,
    );

    const prompt = `You are a QA engineer validating a project plan.

Plan Summary:
- Total Milestones: ${plan.milestones.length}
- Total Tasks: ${plan.totalTasks}
- Estimated Duration: ${plan.estimatedDuration}
- Complexity: ${plan.complexity}
${ragContext}

Check for:
1. Timeline consistency (do estimates add up?)
2. Resource allocation (are team members overloaded?)
3. Dependency loops (circular dependencies?)
4. Missing critical tasks (security, testing, deployment?)
5. Unrealistic estimates

Respond in JSON format:
{
  "isValid": boolean,
  "warnings": ["warning1", "warning2"],
  "suggestions": ["suggestion1", "suggestion2"]
}`;

    const result = await this.validationAgent(prompt);
    return { ...result.data, tokensUsed: result.tokensUsed };
  }
}
