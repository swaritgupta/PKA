import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller'
import { AppService } from './app.service';
import { DocumentModule } from '../document/document.module';
import { ChatModule } from '../chat/chat.module';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'src/backend/.env',
    }),
    
    DocumentModule,
    ChatModule,
    LlmModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
