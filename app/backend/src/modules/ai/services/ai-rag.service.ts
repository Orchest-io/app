import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { OpenAIService } from './openai.service';
import { ProjectEmbedding } from '../entities/project-embedding.entity';
import { RagSearchLog } from '../entities/rag-search-log.entity';
import { Task } from '../../tasks/entities/task.entity';
import { Milestone } from '../../projects/entities/milestone.entity';
import { Project } from '../../projects/entities/project.entity';
import { ProjectStoryPointConfig } from '../../projects/entities/project-story-point-config.entity';

@Injectable()
export class AiRagService {
  private readonly logger = new Logger(AiRagService.name);

  constructor(
    @InjectRepository(ProjectEmbedding)
    private embeddingRepo: Repository<ProjectEmbedding>,
    @InjectRepository(RagSearchLog)
    private searchLogRepo: Repository<RagSearchLog>,
    private openaiService: OpenAIService,
    private dataSource: DataSource,
  ) {}

  /**
   * Event handler: Auto-index project when created
   */
  @OnEvent('project.created')
  async handleProjectCreated(payload: { projectId: string }): Promise<void> {
    this.logger.log(`Auto-indexing project ${payload.projectId} for RAG`);
    try {
      await this.indexProjectData(payload.projectId);
      this.logger.log(`✅ Indexing complete for project ${payload.projectId}`);
    } catch (error) {
      this.logger.error(`❌ Indexing failed for project ${payload.projectId}: ${error}`);
    }
  }

  /**
   * Index project data: project summary, milestones, and tasks
   * Creates embeddings and stores them in project_embeddings table
   */
  async indexProjectData(projectId: string): Promise<void> {
    const projectRepo = this.dataSource.getRepository(Project);
    const taskRepo = this.dataSource.getRepository(Task);
    const milestoneRepo = this.dataSource.getRepository(Milestone);

    // Fetch project data
    const project = await projectRepo.findOne({ where: { id: projectId } });
    const tasks = await taskRepo.find({ where: { projectId } });
    const milestones = await milestoneRepo.find({ where: { projectId } });
    const spConfigRepo = this.dataSource.getRepository(ProjectStoryPointConfig);
    const spConfigs = await spConfigRepo.find({
      where: { projectId },
      order: { storyPointValue: 'ASC' },
    });

    if (!project) {
      this.logger.warn(`Project ${projectId} not found, skipping indexing`);
      return;
    }

    // Delete old embeddings for this project (if re-indexing)
    await this.embeddingRepo.delete({ projectId });

    const embeddingsToCreate: Partial<ProjectEmbedding>[] = [];

    // 1. Index Project Summary
    let storyPointMatrix = '';
    if (spConfigs.length > 0) {
      storyPointMatrix = `\nStory Point Calibration Matrix:\n` + spConfigs.map(c => `- ${c.storyPointValue} SP = ${c.hoursEquivalent} hours`).join('\n');
    } else {
      storyPointMatrix = `\nStory Point Calibration Matrix (Default):\n- 1 SP = 4 hours\n- 2 SP = 8 hours\n- 3 SP = 16 hours\n- 5 SP = 40 hours\n- 8 SP = 80 hours`;
    }

    const projectSummary = [
      `Project: ${project.name}`,
      project.description ? `Description: ${project.description}` : '',
      `Status: ${project.status || 'active'}`,
      storyPointMatrix
    ]
      .filter(Boolean)
      .join('\n');

    if (projectSummary.trim()) {
      try {
        const embedding = await this.openaiService.createEmbedding(projectSummary);
        embeddingsToCreate.push({
          projectId,
          contentType: 'project_summary',
          contentText: projectSummary,
          embedding,
          metadata: {
            projectName: project.name,
            projectStatus: project.status,
          },
        });
      } catch (error) {
        this.logger.warn(`Failed to embed project summary: ${error}`);
      }
    }

    // 2. Index Milestones
    for (const milestone of milestones) {
      const milestoneText = [
        `Milestone: ${milestone.title}`,
        milestone.description ? `Description: ${milestone.description}` : '',
        `Status: ${milestone.status || 'pending'}`,
        milestone.targetDate
          ? `Target Date: ${new Date(milestone.targetDate).toISOString().split('T')[0]}`
          : '',
      ]
        .filter(Boolean)
        .join('\n');

      try {
        const embedding = await this.openaiService.createEmbedding(milestoneText);
        embeddingsToCreate.push({
          projectId,
          contentType: 'milestone',
          contentText: milestoneText,
          embedding,
          metadata: {
            milestoneId: milestone.id,
            milestoneTitle: milestone.title,
            milestoneStatus: milestone.status,
          },
        });
      } catch (error) {
        this.logger.warn(`Failed to embed milestone ${milestone.id}: ${error}`);
      }
    }

    // 3. Index Tasks
    for (const task of tasks) {
      const taskText = [
        `Task: ${task.title}`,
        task.description ? `Description: ${task.description}` : '',
        `Type: ${task.type || 'feature'}`,
        `Priority: ${task.priority || 'medium'}`,
        `Status: ${task.status || 'backlog'}`,
        task.estimatedHours ? `Estimated Hours: ${task.estimatedHours}h` : '',
      ]
        .filter(Boolean)
        .join('\n');

      try {
        const embedding = await this.openaiService.createEmbedding(taskText);
        embeddingsToCreate.push({
          projectId,
          contentType: 'task',
          contentText: taskText,
          embedding,
          metadata: {
            taskId: task.id,
            taskTitle: task.title,
            taskType: task.type,
            taskPriority: task.priority,
            taskStatus: task.status,
          },
        });
      } catch (error) {
        this.logger.warn(`Failed to embed task ${task.id}: ${error}`);
      }
    }

    // Batch save all embeddings
    if (embeddingsToCreate.length > 0) {
      await this.embeddingRepo.save(embeddingsToCreate);
      this.logger.log(
        `✅ Indexed ${embeddingsToCreate.length} items for project ${projectId} ` +
        `(1 summary + ${milestones.length} milestones + ${tasks.length} tasks)`,
      );
    } else {
      this.logger.warn(`No content to index for project ${projectId}`);
    }
  }

  /**
   * Search for similar project content using semantic search
   * Uses pgvector for fast vector similarity search
   */
  async retrieveSimilarContext(
    query: string,
    userId: string,
    limit: number = 5,
    similarityThreshold: number = 0.7,
  ): Promise<{ text: string; similarity: number; projectId: string; contentType: string }[]> {
    const startTime = Date.now();
    
    try {
      // Generate query embedding
      const queryEmbedding = await this.openaiService.createEmbedding(query);

      // Use pgvector's cosine distance operator for fast search
      // Note: <=> operator returns distance (0 = identical, 2 = opposite)
      // Similarity = 1 - (distance / 2)
      const results = await this.embeddingRepo
        .createQueryBuilder('pe')
        .select([
          'pe.id',
          'pe.projectId',
          'pe.contentType',
          'pe.contentText',
          'pe.metadata',
        ])
        .addSelect(`1 - (pe.embedding <=> :queryEmbedding) / 2`, 'similarity')
        .where(`1 - (pe.embedding <=> :queryEmbedding) / 2 >= :threshold`)
        .setParameter('queryEmbedding', JSON.stringify(queryEmbedding))
        .setParameter('threshold', similarityThreshold)
        .orderBy('pe.embedding <=> :queryEmbedding', 'ASC')
        .limit(limit)
        .getRawMany();

      const searchDuration = Date.now() - startTime;

      // Log search for analytics
      await this.logSearch(
        userId,
        query,
        queryEmbedding,
        results.length,
        results.map((r) => r.pe_projectId),
        searchDuration,
      );

      return results.map((r) => ({
        text: r.pe_contentText,
        similarity: parseFloat(r.similarity),
        projectId: r.pe_projectId,
        contentType: r.pe_contentType,
      }));
    } catch (error) {
      this.logger.error(`RAG retrieval failed: ${error}`);
      // Return empty results on error (don't break AI flow)
      return [];
    }
  }

  /**
   * Format retrieved context for AI prompt
   * Adds clear structure and metadata
   */
  async formatContextForPrompt(query: string, userId: string = 'system'): Promise<string> {
    const results = await this.retrieveSimilarContext(query, userId);
    
    if (results.length === 0) {
      return '';
    }

    const sections = results.map((r, i) => {
      const matchPercent = (r.similarity * 100).toFixed(0);
      const typeLabel = this.getContentTypeLabel(r.contentType);
      return `[${typeLabel} ${i + 1} - ${matchPercent}% match]\n${r.text}`;
    });

    return [
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '📚 SIMILAR PAST PROJECTS (for reference)',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      ...sections,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '',
    ].join('\n');
  }

  /**
   * ========================================
   * ADVANCED RAG: Multi-Query Expansion
   * ========================================
   * Expands query into multiple variations for better retrieval
   */
  async expandQuery(originalQuery: string): Promise<string[]> {
    try {
      const prompt = `Given this search query: "${originalQuery}"

Generate 2 alternative phrasings that capture the same intent.
These will search a project management database.

Return ONLY a JSON array:
["alternative 1", "alternative 2"]`;

      const { content } = await this.openaiService.callChatCompletion(
        prompt,
        'gpt-4o-mini',
        0.7,
        500,
      );

      const alternatives = JSON.parse(content);
      return [originalQuery, ...alternatives];
    } catch (error) {
      this.logger.warn(`Query expansion failed: ${error}`);
      return [originalQuery];  // Fallback to original
    }
  }

  /**
   * ========================================
   * ADVANCED RAG: Multi-Vector Retrieval
   * ========================================
   * Searches using multiple query variations
   */
  async multiVectorRetrieval(
    queries: string[],
    userId: string,
    limit: number = 5,
  ): Promise<any[]> {
    const allResults: any[] = [];

    for (const query of queries) {
      const results = await this.retrieveSimilarContext(query, userId, limit, 0.7);
      allResults.push(...results);
    }

    // Remove duplicates
    const uniqueResults = this.removeDuplicates(allResults);
    return uniqueResults.slice(0, limit * 2);  // Return top results
  }

  /**
   * Remove duplicate results based on projectId + contentType
   */
  private removeDuplicates(results: any[]): any[] {
    const seen = new Set<string>();
    return results.filter((r) => {
      const key = `${r.projectId}-${r.contentType}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * ========================================
   * ADVANCED RAG: Re-ranking
   * ========================================
   * Re-ranks results based on multiple factors
   */
  async reRankResults(results: any[], query: string): Promise<any[]> {
    const scoredResults = results.map((result) => {
      let score = result.similarity;  // Base score

      // Factor 1: Content type boost
      if (result.contentType === 'task') score += 0.05;
      if (result.contentType === 'milestone') score += 0.03;

      // Factor 2: Metadata boost (if available)
      if (result.metadata?.status === 'completed') {
        score += 0.10;  // Completed projects are better examples
      }

      return { ...result, finalScore: score };
    });

    return scoredResults
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 5);
  }

  /**
   * ========================================
   * ADVANCED RAG: Complete Pipeline
   * ========================================
   * Full RAG pipeline with expansion, retrieval, and re-ranking
   */
  async advancedRetrievalPipeline(
    query: string,
    userId: string,
  ): Promise<string> {
    this.logger.log(`🚀 Advanced RAG Pipeline for: "${query}"`);

    // Step 1: Query Expansion
    const expandedQueries = await this.expandQuery(query);
    this.logger.log(`   📝 Expanded to ${expandedQueries.length} queries`);

    // Step 2: Multi-Vector Retrieval
    const allResults = await this.multiVectorRetrieval(expandedQueries, userId, 5);
    this.logger.log(`   🔍 Found ${allResults.length} results`);

    if (allResults.length === 0) {
      return '';
    }

    // Step 3: Re-ranking
    const reRankedResults = await this.reRankResults(allResults, query);
    this.logger.log(`   🎯 Re-ranked to top ${reRankedResults.length}`);

    // Step 4: Format for prompt
    const sections = reRankedResults.map((r, i) => {
      const matchPercent = (r.finalScore * 100).toFixed(0);
      const typeLabel = this.getContentTypeLabel(r.contentType);
      return `[${typeLabel} ${i + 1} - ${matchPercent}% relevance]\n${r.text}`;
    });

    return [
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '📚 RELEVANT PAST EXPERIENCES (analyzed)',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      ...sections,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '',
    ].join('\n');
  }

  /**
   * Log search for analytics and monitoring
   */
  private async logSearch(
    userId: string,
    queryText: string,
    queryEmbedding: number[],
    resultsCount: number,
    topProjectIds: string[],
    searchDurationMs: number,
  ): Promise<void> {
    try {
      await this.searchLogRepo.save({
        userId,
        queryText,
        queryEmbedding,
        resultsCount,
        topProjectIds,
        searchDurationMs,
      });
    } catch (error) {
      // Don't fail if logging fails
      this.logger.warn(`Failed to log RAG search: ${error}`);
    }
  }

  /**
   * Get human-readable label for content type
   */
  private getContentTypeLabel(contentType: string): string {
    const labels: Record<string, string> = {
      project_summary: 'Project',
      milestone: 'Milestone',
      task: 'Task',
      retrospective: 'Retrospective',
    };
    return labels[contentType] || contentType;
  }

  /**
   * Cosine similarity calculation (fallback for non-pgvector setups)
   * Not used when pgvector is available, but kept for compatibility
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
