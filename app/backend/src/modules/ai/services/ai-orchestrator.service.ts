import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { AiRagService } from './ai-rag.service';

// ========================================
// Agent Response Interfaces
// ========================================
interface ProjectAnalysis {
  domain: string;
  projectType: string;
  complexity: 'low' | 'medium' | 'high';
  riskFactors: string[];
  keySuccessFactors: string[];
  similarProjects: number;
  confidence: number;
}

interface ProjectPlan {
  milestones: Array<{
    title: string;
    description: string;
    phase: 'planning' | 'development' | 'testing' | 'deployment';
    estimatedWeeks: number;
    order: number;
    criticality: 'low' | 'medium' | 'high';
    dependencies: string[];
    tasks?: any[];
  }>;
  totalDuration: string;
  criticalPath: string[];
  resourceNeeds: {
    developers: number;
    designers: number;
    other: string[];
  };
}

interface TaskBreakdownResult {
  tasks: Array<{
    title: string;
    description: string;
    type: 'feature' | 'bug' | 'improvement' | 'research';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    complexity: 'simple' | 'medium' | 'complex';
    estimatedHours: number;
    requiredSkills: string[];
    dependencies: string[];
    riskLevel: 'low' | 'medium' | 'high';
    testingRequired: boolean;
  }>;
}

interface EstimationAdjustment {
  taskTitle: string;
  originalHours: number;
  suggestedHours: number;
  reason: string;
  confidence: number;
}

interface EstimationResult {
  adjustments: EstimationAdjustment[];
  totalOriginal: number;
  totalAdjusted: number;
  overallConfidence: number;
}

interface TaskAssignment {
  taskTitle: string;
  assignedTo: string;
  matchScore: number;
  reason: string;
  alternatives: string[];
}

interface AssignmentResult {
  assignments: TaskAssignment[];
  workloadDistribution: Record<string, number>;
  warnings: string[];
}

interface ValidationResult {
  isValid: boolean;
  qualityScore: number;
  warnings: string[];
  suggestions: string[];
  criticalIssues: string[];
  confidence: number;
}

/**
 * ========================================
 * AI ORCHESTRATOR SERVICE
 * ========================================
 * Coordinates multiple specialized AI agents
 * Each agent has a specific role and expertise
 */
@Injectable()
export class AiOrchestratorService {
  private readonly logger = new Logger(AiOrchestratorService.name);

  constructor(
    private openaiService: OpenAIService,
    private aiRagService: AiRagService,
  ) {}

  /**
   * ========================================
   * AGENT 1: Research Agent
   * ========================================
   * Role: Analyzes requirements and gathers context
   * Model: gpt-4o-mini (fast analysis)
   */
  async researchAgent(input: {
    description: string;
    goals?: string;
    userId: string;
  }): Promise<{
    analysis: ProjectAnalysis;
    insights: string[];
    tokensUsed: number;
  }> {
    this.logger.log('🔍 Research Agent: Analyzing requirements...');

    // Get RAG context with advanced pipeline
    const ragContext = await this.aiRagService.advancedRetrievalPipeline(
      [input.description, input.goals].filter(Boolean).join('\n'),
      input.userId,
    );

    const prompt = `You are a Research Agent specialized in requirement analysis.

PROJECT DESCRIPTION:
${input.description}

${input.goals ? `GOALS:\n${input.goals}` : ''}
${ragContext}

Your task: Deep analysis of this project request.

Analyze:
1. Project domain and type
2. Technical complexity
3. Risk factors
4. Similar patterns from past projects
5. Key success factors

Respond in JSON:
{
  "domain": "string (e.g., e-commerce, fintech, SaaS)",
  "projectType": "string (web, mobile, API, etc.)",
  "complexity": "low" | "medium" | "high",
  "riskFactors": ["risk1", "risk2"],
  "keySuccessFactors": ["factor1", "factor2"],
  "similarProjects": number,
  "confidence": number (0-100)
}`;

    const { content, tokensUsed } = await this.openaiService.callChatCompletion(
      prompt,
      'gpt-4o-mini',
      0.6,
      2000,
    );

    const analysis = this.openaiService.parseJsonResponse(content) as ProjectAnalysis;

    // Generate insights

    const insights = this.generateInsights(analysis, ragContext);

    this.logger.log(`   ✅ Complexity: ${analysis.complexity}, Confidence: ${analysis.confidence}%`);

    return { analysis, insights, tokensUsed };
  }

  /**
   * ========================================
   * AGENT 2: Planning Agent
   * ========================================
   * Role: Creates high-level project structure
   * Model: gpt-4o (strongest reasoning)
   */
  async planningAgent(input: {
    analysis: ProjectAnalysis;
    description: string;
    userId: string;
  }): Promise<{
    plan: ProjectPlan;
    tokensUsed: number;
  }> {
    this.logger.log('📋 Planning Agent: Creating project structure...');

    const ragContext = await this.aiRagService.advancedRetrievalPipeline(
      `${input.analysis.projectType} project with ${input.analysis.complexity} complexity`,
      input.userId,
    );

    const prompt = `You are a Planning Agent specialized in project architecture.

ANALYSIS:
- Domain: ${input.analysis.domain}
- Type: ${input.analysis.projectType}
- Complexity: ${input.analysis.complexity}
- Risk Factors: ${input.analysis.riskFactors.join(', ')}

PROJECT:
${input.description}
${ragContext}

Your task: Create optimal project structure.

Design:
1. 3-7 major milestones (logical phases)
2. Estimated timeline (realistic)
3. Critical path identification
4. Resource requirements
5. Dependencies between phases

Respond in JSON:
{
  "milestones": [
    {
      "title": "string",
      "description": "string",
      "phase": "planning" | "development" | "testing" | "deployment",
      "estimatedWeeks": number,
      "order": number,
      "criticality": "low" | "medium" | "high",
      "dependencies": []
    }
  ],
  "totalDuration": "string (e.g., '8 weeks')",
  "criticalPath": ["milestone1", "milestone2"],
  "resourceNeeds": {
    "developers": number,
    "designers": number,
    "other": []
  }
}`;

    const { content, tokensUsed } = await this.openaiService.callChatCompletion(
      prompt,
      'gpt-4o',  // Strongest model for planning
      0.7,
      4000,
    );

    const plan = this.openaiService.parseJsonResponse(content) as ProjectPlan;

    this.logger.log(`   ✅ ${plan.milestones.length} milestones, ${plan.totalDuration}`);

    return { plan, tokensUsed };
  }

  /**
   * ========================================
   * AGENT 3: Breakdown Agent
   * ========================================
   * Role: Decomposes milestones into tasks
   * Model: gpt-4o-mini (efficient breakdown)
   */
  async breakdownAgent(input: {
    milestone: ProjectPlan['milestones'][0];
    projectContext: {
      projectType: string;
      complexity: string;
    };
    userId: string;
  }): Promise<{
    tasks: TaskBreakdownResult['tasks'];
    tokensUsed: number;
  }> {
    this.logger.log(`🔨 Breakdown Agent: ${input.milestone.title}...`);

    const ragContext = await this.aiRagService.advancedRetrievalPipeline(
      `${input.milestone.title}: ${input.milestone.description}`,
      input.userId,
    );

    const prompt = `You are a Breakdown Agent specialized in task decomposition.

MILESTONE:
${input.milestone.title}
${input.milestone.description}

PROJECT CONTEXT:
- Type: ${input.projectContext.projectType}
- Complexity: ${input.projectContext.complexity}
- Phase: ${input.milestone.phase}
${ragContext}

Your task: Break into specific, actionable tasks.

Requirements:
1. Clear, action-oriented titles
2. Technical details in description
3. Realistic hour estimates (1-40 hours)
4. Identify dependencies
5. Assign priority and complexity

Respond in JSON:
{
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "type": "feature" | "bug" | "improvement" | "research",
      "priority": "low" | "medium" | "high" | "urgent",
      "complexity": "simple" | "medium" | "complex",
      "estimatedHours": number,
      "requiredSkills": ["skill1", "skill2"],
      "dependencies": [],
      "riskLevel": "low" | "medium" | "high",
      "testingRequired": boolean
    }
  ]
}`;

    const { content, tokensUsed } = await this.openaiService.callChatCompletion(
      prompt,
      'gpt-4o-mini',
      0.7,
      3000,
    );

    const result = this.openaiService.parseJsonResponse(content) as TaskBreakdownResult;

    this.logger.log(`   ✅ ${result.tasks.length} tasks generated`);

    return { tasks: result.tasks, tokensUsed };
  }

  /**
   * ========================================
   * AGENT 4: Estimation Agent
   * ========================================
   * Role: Validates and refines estimates
   * Model: gpt-4o-mini (quick validation)
   */
  async estimationAgent(input: {
    tasks: TaskBreakdownResult['tasks'];
    historicalData?: any;
  }): Promise<{
    refinedTasks: TaskBreakdownResult['tasks'];
    adjustments: EstimationAdjustment[];
    tokensUsed: number;
  }> {
    this.logger.log('⏱️ Estimation Agent: Refining estimates...');

    const prompt = `You are an Estimation Agent specialized in effort estimation.

TASKS TO REVIEW:
${input.tasks.map((t, i) => `
${i + 1}. ${t.title}
   Complexity: ${t.complexity}
   Current Estimate: ${t.estimatedHours}h
   Skills: ${t.requiredSkills.join(', ')}
`).join('\n')}

${input.historicalData ? `
HISTORICAL DATA:
${input.historicalData}
` : ''}

Your task: Validate and adjust estimates.

Check for:
1. Unrealistic estimates (too high/low)
2. Hidden complexity
3. Missing buffer for unknowns
4. Testing and review time
5. Integration complexity

Respond in JSON:
{
  "adjustments": [
    {
      "taskTitle": "string",
      "originalHours": number,
      "suggestedHours": number,
      "reason": "string",
      "confidence": number (0-100)
    }
  ],
  "totalOriginal": number,
  "totalAdjusted": number,
  "overallConfidence": number
}`;

    const { content, tokensUsed } = await this.openaiService.callChatCompletion(
      prompt,
      'gpt-4o-mini',
      0.5,
      2000,
    );

    const result = this.openaiService.parseJsonResponse(content) as EstimationResult;

    // Apply adjustments
    const refinedTasks = input.tasks.map((task) => {
      const adjustment = result.adjustments.find((a: any) => a.taskTitle === task.title);
      if (adjustment && adjustment.suggestedHours !== task.estimatedHours) {
        return {
          ...task,
          estimatedHours: adjustment.suggestedHours,
          estimationNote: adjustment.reason,
        };
      }
      return task;
    });

    this.logger.log(`   ✅ ${result.adjustments.length} estimates adjusted`);

    return {
      refinedTasks,
      adjustments: result.adjustments,
      tokensUsed,
    };
  }

  /**
   * ========================================
   * AGENT 5: Assignment Agent
   * ========================================
   * Role: Matches tasks to team members
   * Model: gpt-4o-mini (fast matching)
   */
  async assignmentAgent(input: {
    tasks: TaskBreakdownResult['tasks'];
    teamMembers: any[];
  }): Promise<{
    assignments: TaskAssignment[];
    tokensUsed: number;
  }> {
    this.logger.log('👥 Assignment Agent: Matching tasks to team...');

    if (!input.teamMembers || input.teamMembers.length === 0) {
      return { assignments: [], tokensUsed: 0 };
    }

    const prompt = `You are an Assignment Agent specialized in resource allocation.

TEAM MEMBERS:
${input.teamMembers.map((m: any) => `
- ${m.name} (${m.email})
  Role: ${m.jobTitle}
  Skills: ${m.skills}
  Availability: ${m.availability || 'full-time'}
`).join('\n')}

TASKS TO ASSIGN:
${input.tasks.map((t, i) => `
${i + 1}. ${t.title}
   Skills: ${t.requiredSkills.join(', ')}
   Complexity: ${t.complexity}
   Hours: ${t.estimatedHours}h
`).join('\n')}

Your task: Optimal task assignment.

Consider:
1. Skills match (most important)
2. Workload balance
3. Complexity match (experienced members for complex tasks)
4. Dependencies (assign dependent tasks to same person if possible)
5. Availability

Respond in JSON:
{
  "assignments": [
    {
      "taskTitle": "string",
      "assignedTo": "email",
      "matchScore": number (0-100),
      "reason": "string",
      "alternatives": ["email1", "email2"]
    }
  ],
  "workloadDistribution": {
    "member@email": number (total hours)
  },
  "warnings": ["warning if anyone overloaded"]
}`;

    const { content, tokensUsed } = await this.openaiService.callChatCompletion(
      prompt,
      'gpt-4o-mini',
      0.6,
      2000,
    );

    const result = this.openaiService.parseJsonResponse(content) as AssignmentResult;

    this.logger.log(`   ✅ ${result.assignments.length} tasks assigned`);

    return {
      assignments: result.assignments,
      tokensUsed,
    };
  }

  /**
   * ========================================
   * AGENT 6: Validation Agent
   * ========================================
   * Role: Final quality checks
   * Model: gpt-4o-mini (quick validation)
   */
  async validationAgent(input: {
    plan: ProjectPlan;
    tasks: TaskBreakdownResult['tasks'];
    assignments: TaskAssignment[];
  }): Promise<{
    isValid: boolean;
    score: number;
    warnings: string[];
    suggestions: string[];
    tokensUsed: number;
  }> {
    this.logger.log('✅ Validation Agent: Final quality check...');

    const prompt = `You are a Validation Agent specialized in plan review.

PLAN SUMMARY:
- Milestones: ${input.plan.milestones.length}
- Total Tasks: ${input.tasks.length}
- Duration: ${input.plan.totalDuration}
- Assigned: ${input.assignments.length} tasks

DETAILED PLAN:
${JSON.stringify(input, null, 2)}

Your task: Comprehensive validation.

Check for:
1. Missing critical tasks (security, testing, deployment)
2. Dependency loops or conflicts
3. Unrealistic timeline
4. Overloaded team members
5. Missing documentation tasks
6. Integration points
7. Risk mitigation tasks

Respond in JSON:
{
  "isValid": boolean,
  "qualityScore": number (0-100),
  "warnings": ["warning1", "warning2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "criticalIssues": ["issue1"],
  "confidence": number
}`;

    const { content, tokensUsed } = await this.openaiService.callChatCompletion(
      prompt,
      'gpt-4o-mini',
      0.5,
      2000,
    );

    const result = this.openaiService.parseJsonResponse(content) as ValidationResult;

    this.logger.log(`   ✅ Quality Score: ${result.qualityScore}/100`);

    return {
      isValid: result.isValid,
      score: result.qualityScore,
      warnings: result.warnings,
      suggestions: result.suggestions,
      tokensUsed,
    };
  }

  /**
   * ========================================
   * HELPER: Generate Insights
   * ========================================
   */
  private generateInsights(analysis: ProjectAnalysis, ragContext: string): string[] {
    const insights = [];

    if (analysis.complexity === 'high') {
      insights.push('⚠️ High complexity detected - consider phased approach');
    }

    if (analysis.riskFactors.length > 3) {
      insights.push('⚠️ Multiple risk factors - plan mitigation strategies');
    }

    if (analysis.confidence < 70) {
      insights.push('💡 Low confidence - gather more requirements');
    }

    if (ragContext && ragContext.length > 100) {
      insights.push('✅ Similar projects found - leveraging past experience');
    }

    return insights;
  }
}
