import { BadRequestException, Controller, Post, Req, Res } from '@nestjs/common';
import { ChatService } from './chat.service';
import type { Request, Response } from 'express';
import { ChatTurn } from '../types/session.types';

@Controller('/api/channels/v1.0/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('')
  public async chat(@Req() req: Request,@Res() res: Response){
    console.log('chat data is:::', req.body)
    let data = req.body;
    if(!data || typeof data.text !== 'string' || !data.text.trim()){
      throw new BadRequestException('User text is required to generate response!');
    }
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Please login first' });
    }

    const response = await this.chatService.processUserText(data);

    const history: ChatTurn[] = req.session.chatHistory ?? [];
    history.push({
      role: 'user',
      content: data.text.trim(),
      timestamp: new Date().toISOString(),
    });
    history.push({
      role: 'assistant',
      content: String(response.answer ?? ''),
      timestamp: new Date().toISOString(),
    });

    req.session.chatHistory = history;
    req.session.sessionStartedAt =
      req.session.sessionStartedAt ?? new Date().toISOString();
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => (err ? reject(err) : resolve()));
    });

    return res.status(200).json(response);
  }
}
