import { RecordMetadata } from "@pinecone-database/pinecone";

export interface UserMessageInterface extends RecordMetadata{
  text: string;
}