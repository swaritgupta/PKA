import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;


@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true })
  username!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true, select: false })
  password!: string;
}

const schema = SchemaFactory.createForClass(User);

export const UserSchema = schema;
