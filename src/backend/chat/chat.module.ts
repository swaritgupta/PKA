import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { VectorModule } from '../vector/vector.module';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [VectorModule, LlmModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService]
})
export class ChatModule {}
