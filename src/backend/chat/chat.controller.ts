import { BadRequestException, Controller, Post, Req, Res } from '@nestjs/common';
import { ChatService } from './chat.service';
import type { Request, Response } from 'express';

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
    const response = await this.chatService.processUserText(data);
    return res.status(200).json(response);
  }
}
