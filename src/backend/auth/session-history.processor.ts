import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { UserService } from '../user/user.service';
import {ARCHIVE_SESSION_HISTORY_JOB,SESSION_HISTORY_QUEUE} from '../queues/queue.constants';
import { ChatTurn } from '../types/session.types';

interface SessionHistoryJobPayload {
  userId: string;
  sessionId: string;
  sessionStartedAt: string;
  sessionEndedAt: string;
  chatHistory: ChatTurn[];
}

@Processor(SESSION_HISTORY_QUEUE)
export class SessionHistoryProcessor {
  constructor(private readonly userService: UserService) {}

  // Worker that stores session chat archive in Mongo collection UserDataCollection.
  @Process(ARCHIVE_SESSION_HISTORY_JOB)
  async archiveSessionHistory(job: Job<SessionHistoryJobPayload>) {
    return this.userService.saveSessionHistory(job.data);
  }
}
