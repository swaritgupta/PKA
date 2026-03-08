import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDataDocument = HydratedDocument<UserData>;

@Schema({ _id: false })
export class ChatMessage {
  @Prop({ required: true, enum: ['user', 'assistant'] })
  role!: 'user' | 'assistant';

  @Prop({ required: true })
  content!: string;

  @Prop({ required: true })
  timestamp!: string;
}

@Schema({
  timestamps: true,
  collection: 'UserDataCollection',
})
export class UserData {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  sessionId!: string;

  @Prop({ required: true })
  sessionStartedAt!: string;

  @Prop({ required: true })
  sessionEndedAt!: string;

  @Prop({ type: [ChatMessage], default: [] })
  chatHistory!: ChatMessage[];
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
export const UserDataSchema = SchemaFactory.createForClass(UserData);
