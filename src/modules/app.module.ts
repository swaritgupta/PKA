import { Module } from '@nestjs/common';
import { AppController } from '../backend/controllers/app.controller'
import { AppService } from '../backend/services/app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
