import { Module } from '@nestjs/common';
import { VectorController } from '../../controllers/vector/vector.controller';
import { VectorService } from '../../services/vector/vector.service';
@Module({
  controllers: [VectorController],
  providers:[VectorService],
  exports: [VectorService]
})
export class VectorModule {

}
