import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller'
import { AppService } from './app.service';
import { DocumentModule } from '../document/document.module';
import { ChatModule } from '../chat/chat.module';
import { LlmModule } from '../llm/llm.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'src/backend/.env',
    }),
    // Global Bull config: all queues use the same Redis backend.
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),
    // Create the MongoDB connection used by all Mongoose models
    MongooseModule.forRoot(process.env.MONGO_DB_URL ?? 'mongodb://localhost:27017/pka2'),
    DocumentModule,
    ChatModule,
    LlmModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
