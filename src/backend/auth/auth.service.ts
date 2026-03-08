import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  ARCHIVE_SESSION_HISTORY_JOB,
  SESSION_HISTORY_QUEUE,
} from '../queues/queue.constants';
import { ChatTurn } from '../types/session.types';

@Injectable()
export class AuthService {
  constructor(
    @InjectQueue(SESSION_HISTORY_QUEUE)
    private readonly sessionHistoryQueue: Queue,
  ) {}

  // Queue producer: archive session history asynchronously during logout.
  async enqueueSessionHistoryArchive(payload: {
    userId: string;
    sessionId: string;
    sessionStartedAt: string;
    sessionEndedAt: string;
    chatHistory: ChatTurn[];
  }) {
    return this.sessionHistoryQueue.add(ARCHIVE_SESSION_HISTORY_JOB, payload, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}
