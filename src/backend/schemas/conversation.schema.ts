import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({
  timestamps: true
})
export class Conversation{

  @Prop()
  sessionId!: string;

  @Prop()
  userId!: string;

  @Prop()
  userMessage!: string;

  @Prop()
  assistantMessage!: string;

}