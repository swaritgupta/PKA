import { Injectable } from '@nestjs/common';
const pdf = require('pdf-parse');
import mammoth from 'mammoth';
import fs from 'fs';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

@Injectable()
export class DocumentService {

  async createTokens(file: Express.Multer.File){
    if(!file){
      throw new Error('File is required');
    }
    let rawText: string;
    if(file.mimetype == 'application/pdf'){
       rawText = await this.handlePDF(file)
    }
    else if(file.mimetype == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'){
      rawText = await this.handleDOX(file)
    }
    else if(file.mimetype == 'text/plain'){
      rawText= await this.handleTXT(file)
    }
    else{
      throw new Error('Unsupported file type')
    }
    //splitting text recursively
    const document = await this.splitTextRecursively(rawText);
    console.log('document is:::', document)
    return;
  }

  async handlePDF(file: Express.Multer.File){
    const data = fs.readFileSync(file.path)
    const result = await pdf(data)
    return result.text;
  }

  async handleDOX(file: Express.Multer.File){
    const result = await mammoth.extractRawText({path: file.path})
    return result.value
  }

  async handleTXT(file: Express.Multer.File){
    const result = fs.readFileSync(file.path, 'utf-8')
    return result
  }

  async splitTextRecursively(text:  string){
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,       // max tokens per chunk
      chunkOverlap: 100,    // overlap between chunks
      separators: ['\n\n', '\n', ' ', ''], // recursive fallback
    });
    return await splitter.createDocuments([text])
  }
}
