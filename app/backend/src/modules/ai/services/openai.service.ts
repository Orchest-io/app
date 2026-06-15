import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly openai: OpenAI | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      this.logger.warn('OPENAI_API_KEY not configured — AI features will be disabled');
      return;
    }
    this.logger.log('OpenAI service initialized successfully');
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Call OpenAI chat completion API with messages array (supports system prompt)
   */
  async callChat(
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    model: string = 'gpt-4o-mini',
    temperature: number = 0.7,
    maxTokens: number = 1000,
  ): Promise<{ content: string; tokensUsed: number }> {
    if (!this.openai) {
      throw new Error('OpenAI service is not configured. Please set OPENAI_API_KEY in environment variables.');
    }

    try {
      this.logger.log(`Calling OpenAI ${model} — ${messages.length} messages`);

      const completion = await this.openai.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      });

      const content = completion.choices[0]?.message?.content || '';
      const tokensUsed = completion.usage?.total_tokens || 0;

      this.logger.log(`Response received: ${tokensUsed} tokens used`);
      return { content, tokensUsed };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`OpenAI API error: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * Call OpenAI chat completion API
   */
  async callChatCompletion(
    prompt: string,
    model: string = 'gpt-4o-mini',
    temperature: number = 0.7,
    maxTokens: number = 4000,
  ): Promise<{ content: string; tokensUsed: number }> {
    if (!this.openai) {
      throw new Error('OpenAI service is not configured. Please set OPENAI_API_KEY in environment variables.');
    }

    try {
      this.logger.log(`Calling OpenAI ${model} with ${prompt.length} chars`);

      const completion = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature,
        max_tokens: maxTokens,
      });

      const content = completion.choices[0]?.message?.content || '';
      const tokensUsed = completion.usage?.total_tokens || 0;

      this.logger.log(`Response received: ${tokensUsed} tokens used`);

      return { content, tokensUsed };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`OpenAI API error: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * Create embedding vector from text
   * Uses text-embedding-3-small (1536 dimensions)
   */
  async createEmbedding(text: string): Promise<number[]> {
    if (!this.openai) {
      throw new Error('OpenAI service is not configured.');
    }

    try {
      const MAX_TEXT_LENGTH = 8000;
      const truncated = text.length > MAX_TEXT_LENGTH
        ? text.slice(0, MAX_TEXT_LENGTH)
        : text;

      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: truncated,
      });

      return response.data[0].embedding;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`OpenAI embedding error: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Parse JSON response from AI (with error handling)
   */
  parseJsonResponse<T>(content: string): T {
    try {
      // Remove markdown code blocks if present
      const cleaned = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      return JSON.parse(cleaned);
    } catch (error) {
      this.logger.error(`Failed to parse JSON: ${content}`);
      throw new Error('Invalid JSON response from AI');
    }
  }
}
