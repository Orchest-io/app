import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService implements OnModuleInit {
  private supabaseClient: SupabaseClient;
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_PRIVATE_KEY');

    if (!url || !key) {
      this.logger.warn(
        'Supabase storage config is missing: SUPABASE_URL or SUPABASE_PRIVATE_KEY. File uploads will fail.',
      );
      return;
    }

    this.supabaseClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    this.logger.log('Supabase client initialized successfully.');
  }

  async uploadFile(
    bucket: string,
    path: string,
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    if (!this.supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    const { error } = await this.supabaseClient.storage
      .from(bucket)
      .upload(path, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      this.logger.error(`Failed to upload file to ${bucket}/${path}: ${error.message}`);
      throw error;
    }

    const { data: publicUrlData } = this.supabaseClient.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  }

  async getSignedUrl(
    bucket: string,
    path: string,
    expiresInSeconds = 3600,
  ): Promise<string> {
    if (!this.supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await this.supabaseClient.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSeconds);

    if (error) {
      this.logger.error(`Failed to get signed URL for ${bucket}/${path}: ${error.message}`);
      throw error;
    }

    return data.signedUrl;
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    if (!this.supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    const { error } = await this.supabaseClient.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      this.logger.error(`Failed to delete file from ${bucket}/${path}: ${error.message}`);
      throw error;
    }
  }
}
