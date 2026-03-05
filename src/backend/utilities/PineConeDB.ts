import { Pinecone, Index } from "@pinecone-database/pinecone";
import { UserMessageInterface } from "../interfaces/PineConeDBInterface";


export class PineCone{
  private pc: Pinecone;
  private index: Index<UserMessageInterface>;;
  constructor(){
    this.pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY ?? "",
    });
    this.index = this.pc.index<UserMessageInterface>({ name: "pka2bot" });
  }

  public getObject(){
    return this.index;
  }
}