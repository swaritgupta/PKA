import 'express-session';
import { ChatTurn } from './session.types';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    sessionStartedAt?: string;
    chatHistory?: ChatTurn[];
  }
}
