import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

interface PixVerseConfig {
  model?: string;
  quality?: string;
  aspectRatio?: string;
  duration?: number;
  image?: string;
  multiShot?: boolean;
}

export class PixVerseIntegration {
  private outputDir: string;

  constructor(outputDir: string = './uploads') {
    this.outputDir = outputDir;
  }

  async generateVideo(
    prompt: string,
    config: PixVerseConfig = {}
  ): Promise<{ videoId: string; videoUrl: string; coverUrl: string }> {
    const {
      model = 'v6',
      quality = '720p',
      aspectRatio = '9:16',
      duration = 5,
      image,
      multiShot
    } = config;

    const safePrompt = prompt.replace(/"/g, '\\"');
    const rawImage = typeof image === 'string' ? image.replace(/"/g, '\\"') : '';
    const normalizedImage = rawImage.startsWith('//')
      ? `https:${rawImage}`
      : rawImage.startsWith('http://')
        ? `https://${rawImage.slice('http://'.length)}`
        : rawImage;
    const imageArg = normalizedImage && /^https?:\/\//.test(normalizedImage) ? ` --image "${normalizedImage}"` : '';
    const multiShotArg = multiShot ? ' --multi-shot' : '';

    const command = `pixverse create video --prompt "${safePrompt}"${imageArg}${multiShotArg} --model ${model} --quality ${quality} --aspect-ratio ${aspectRatio} --duration ${duration} --json`;

    console.log('Executing PixVerse command:', command);

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.outputDir,
        timeout: 300000,
        maxBuffer: 10 * 1024 * 1024
      });

      if (stderr) {
        console.log('PixVerse stderr:', stderr);
      }

      const result = JSON.parse(stdout);
      
      if (result.status === 'submitted' || result.status === 'completed') {
        return {
          videoId: result.video_id?.toString() || result.videoId,
          videoUrl: result.video_url || '',
          coverUrl: result.cover_url || ''
        };
      }

      throw new Error(`PixVerse generation failed: ${JSON.stringify(result)}`);
    } catch (error: any) {
      console.error('PixVerse error:', error);
      throw error;
    }
  }

  async downloadVideo(videoId: string, outputFilename: string): Promise<string> {
    const command = `pixverse asset download ${videoId} --json`;

    console.log('Downloading video:', videoId);

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.outputDir,
        timeout: 120000
      });

      if (stderr) {
        console.log('Download stderr:', stderr);
      }

      const result = JSON.parse(stdout);
      const localPath = result.local_path || path.join(this.outputDir, outputFilename);

      console.log('Video downloaded to:', localPath);
      return localPath;
    } catch (error: any) {
      console.error('Download error:', error);
      throw error;
    }
  }

  async waitForCompletion(videoId: string, timeout: number = 300000): Promise<any> {
    const command = `pixverse task wait ${videoId} --timeout ${timeout} --json`;

    console.log('Waiting for video completion:', videoId);

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.outputDir,
        timeout: timeout + 10000
      });

      if (stderr) {
        console.log('Task wait stderr:', stderr);
      }

      return JSON.parse(stdout);
    } catch (error: any) {
      console.error('Task wait error:', error);
      throw error;
    }
  }

  async checkCredits(): Promise<number> {
    try {
      const { stdout } = await execAsync('pixverse auth status --json', {
        timeout: 10000
      });
      
      const result = JSON.parse(stdout);
      return result.credits || 0;
    } catch (error: any) {
      console.error('Credits check error:', error);
      return 0;
    }
  }
}

export default PixVerseIntegration;
