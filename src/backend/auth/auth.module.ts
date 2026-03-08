import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { SESSION_HISTORY_QUEUE } from '../queues/queue.constants';
import { SessionHistoryProcessor } from './session-history.processor';

@Module({
  imports: [
    UserModule,
    BullModule.registerQueue({
      name: SESSION_HISTORY_QUEUE,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionHistoryProcessor],
})
export class AuthModule {}
