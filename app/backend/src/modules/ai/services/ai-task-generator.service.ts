import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { AiUsageService } from './ai-usage.service';
import { ProjectsService } from '../../projects/projects.service';
import { GenerateTaskRequestDto } from '../dto/generate-task.dto';
import { GeneratedTaskResponseDto } from '../dto/generated-task-response.dto';

export interface ProjectContextPayload {
  projectName: string;
  projectDescription: string;
  milestones: Array<{ title: string; status: string }>;
  teamMembers: Array<{
    userId: string;
    fullName: string;
    role: string;
    jobTitle: string;
    skills: string;
    email: string;
    avatarUrl: string;
  }>;
}

export const SYSTEM_MESSAGE =
  'You are a senior software engineering manager helping a team create well-defined tasks.\n' +
  'You always respond with valid JSON only — no markdown, no explanation, no extra text.';

@Injectable()
export class AiTaskGeneratorService {
  private readonly logger = new Logger(AiTaskGeneratorService.name);

  constructor(
    private openAIService: OpenAIService,
    private aiUsageService: AiUsageService,
    private projectsService: ProjectsService,
  ) {}

  buildPrompt(context: ProjectContextPayload, dto: GenerateTaskRequestDto): string {
    const milestonesSection = context.milestones.length > 0
      ? context.milestones.map((m) => `- ${m.title} (${m.status})`).join('\n')
      : '- (no milestones)';

    const teamMembersSection = context.teamMembers.length > 0
      ? context.teamMembers
          .map(
            (m) =>
              `- ${m.fullName} | Role: ${m.role} | Title: ${m.jobTitle} | Skills: ${m.skills}`,
          )
          .join('\n')
      : '- (no team members)';

    const hintsSection = dto.hints && dto.hints.trim().length > 0
      ? `\nAdditional Hints:\n${dto.hints}\n`
      : '';

    return (
      `You are creating a task for the following project:\n` +
      `\n` +
      `Project: ${context.projectName}\n` +
      `Description: ${context.projectDescription}\n` +
      `\n` +
      `Milestones:\n` +
      `${milestonesSection}\n` +
      `\n` +
      `Team Members:\n` +
      `${teamMembersSection}\n` +
      `\n` +
      `Task Scope: ${dto.scope}\n` +
      `\n` +
      `Task Description:\n` +
      `${dto.description}\n` +
      hintsSection +
      `\n` +
      `Generate a single, well-defined task. Choose between 1 and 3 suggestedAssignees from the team members above based on skills match. If no team members are available, return an empty suggestedAssignees array.\n` +
      `\n` +
      `Respond ONLY with this JSON structure:\n` +
      `{\n` +
      `  "title": "string",\n` +
      `  "description": "string",\n` +
      `  "type": "feature" | "bug" | "improvement",\n` +
      `  "priority": "low" | "medium" | "high" | "urgent",\n` +
      `  "estimatedHours": number,\n` +
      `  "storyPoints": 1 | 2 | 3 | 5 | 8 | 13,\n` +
      `  "dueDate": "YYYY-MM-DD" | null,\n` +
      `  "subtasks": ["string", ...],\n` +
      `  "suggestedAssignees": [\n` +
      `    { "userId": "uuid", "fullName": "string", "avatarUrl": "string" }\n` +
      `  ]\n` +
      `}`
    );
  }

  async generateTask(
    userId: string,
    dto: GenerateTaskRequestDto,
  ): Promise<{ task: GeneratedTaskResponseDto; tokensUsed: number; modelUsed: string }> {
    // 1. Load project context via ProjectsService
    const project = await this.projectsService.findOne(dto.projectId, userId);

    const context: ProjectContextPayload = {
      projectName: project.name,
      projectDescription: project.description ?? '',
      milestones: (project.milestones ?? []).map((m) => ({
        title: m.title,
        status: m.status,
      })),
      teamMembers: (project.members ?? []).map((member) => ({
        userId: member.user?.id ?? member.userId,
        fullName: member.user?.fullName ?? '',
        role: member.role,
        jobTitle: member.jobTitle ?? '',
        skills: member.skills ?? '',
        email: member.user?.email ?? '',
        avatarUrl: member.user?.avatarUrl ?? '',
      })),
    };

    // 2. Build prompt
    const userMessage = this.buildPrompt(context, dto);

    // 3. Call OpenAI — let network/provider errors propagate as-is
    const { content, tokensUsed } = await this.openAIService.callChat(
      [
        { role: 'system', content: SYSTEM_MESSAGE },
        { role: 'user', content: userMessage },
      ],
      'gpt-4o-mini',
      0.7,
      2000,
    );

    // 4. Parse JSON — wrap parse failures as SyntaxError for the controller to map to 502
    let task: GeneratedTaskResponseDto;
    try {
      task = this.openAIService.parseJsonResponse<GeneratedTaskResponseDto>(content);
    } catch (error) {
      const originalMessage = error instanceof Error ? error.message : String(error);
      throw new SyntaxError('AI returned invalid JSON: ' + originalMessage);
    }

    // 5. Return structured result (usage logging is handled by the controller)
    return { task, tokensUsed, modelUsed: 'gpt-4o-mini' };
  }
}
