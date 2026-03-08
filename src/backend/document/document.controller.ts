import { BadRequestException, Controller, Get, Param, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import type { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { DocumentService } from './document.service';
import { EmbeddingProvider } from '../vector/vector.service';

@Controller('/api/channels/v1.0/upload')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'data'),
        filename: (req, file, callback) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueName + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedTypes = ['application/pdf', 'text/plain'];
        if (!allowedTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException('Unsupported file type'),
            false,
          );
        }
        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  public async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request, @Res() res: Response){
    if(!file){
      throw new BadRequestException('File is required');
    }
    try{
      const rawProvider =
        (req.body?.embeddingProvider as string | undefined) ??
        (req.query?.embeddingProvider as string | undefined);
      const provider: EmbeddingProvider = rawProvider === 'voyage' ? 'voyage' : 'gemini';

      console.log('We have file here', provider)
      const job = await this.documentService.enqueueDocumentProcessingJob(
        file,
        provider,
      );
      return res.status(202).json({
        message: 'Document queued for processing',
        jobId: job.id,
      });
    }
    catch(error){
      return res.status(400).json(error)
    }
  }

  // Optional endpoint to check background document job status.
  @Get('/jobs/:id')
  async getJobStatus(@Param('id') id: string, @Res() res: Response) {
    const job = await this.documentService.getDocumentJobById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const state = await job.getState();
    const progress = job.progress();
    const failedReason = job.failedReason;
    const result = job.returnvalue;

    return res.status(200).json({
      id,
      state,
      progress,
      failedReason,
      result,
    });
  }
}
